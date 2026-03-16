from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
import uuid
import io
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from pathlib import Path
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.units import cm, mm

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "staff"
    staff_category: str = "Teachers"

class StaffCreate(BaseModel):
    email: str
    name: str
    staff_category: str
    password: str = "staff123"

class PathCreate(BaseModel):
    name: str
    description: str
    target_role: str
    module_ids: List[str]
    certificate_expiry_days: int = 365

class PathUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    module_ids: Optional[List[str]] = None
    certificate_expiry_days: Optional[int] = None

class ProgressUpdate(BaseModel):
    current_section: int

class ExamSubmit(BaseModel):
    path_id: str
    answers: List[int]

class AssignPath(BaseModel):
    user_id: str
    path_id: str

class CertExpiryUpdate(BaseModel):
    path_id: str
    expiry_days: int

class CodeLogin(BaseModel):
    code: str

class GenerateCode(BaseModel):
    user_id: str
    label: str = ""

# --- Auth Helpers ---
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": data.role,
        "staff_category": data.staff_category,
        "assigned_path_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_doc["id"], user_doc["role"])
    return {"token": token, "user": {k: v for k, v in user_doc.items() if k not in ["password_hash", "_id"]}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {k: v for k, v in user.items() if k != "password_hash"}}

@api_router.post("/auth/login-code")
async def login_with_code(data: CodeLogin):
    code_doc = await db.login_codes.find_one({"code": data.code.strip().upper(), "is_active": True}, {"_id": 0})
    if not code_doc:
        raise HTTPException(status_code=401, detail="Invalid or expired code")
    if code_doc.get("expires_at") and code_doc["expires_at"] < datetime.now(timezone.utc).isoformat():
        await db.login_codes.update_one({"code": code_doc["code"]}, {"$set": {"is_active": False}})
        raise HTTPException(status_code=401, detail="Code has expired")
    user = await db.users.find_one({"id": code_doc["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    await db.login_codes.update_one({"code": code_doc["code"]}, {"$set": {"last_used": datetime.now(timezone.utc).isoformat(), "use_count": code_doc.get("use_count", 0) + 1}})
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {k: v for k, v in user.items() if k != "password_hash"}}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password_hash"}

# --- User Management (Admin) ---
@api_router.get("/users")
async def list_users(user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/users/create-staff")
async def create_staff(data: StaffCreate, user: dict = Depends(require_admin)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    role_to_path = {}
    paths = await db.learning_paths.find({}, {"_id": 0}).to_list(100)
    for p in paths:
        role_to_path[p["target_role"]] = p["id"]
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": "staff",
        "staff_category": data.staff_category,
        "assigned_path_id": role_to_path.get(data.staff_category),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    await db.users.insert_one(user_doc)
    return {k: v for k, v in user_doc.items() if k not in ["password_hash", "_id"]}

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, updates: dict, admin: dict = Depends(require_admin)):
    safe_updates = {k: v for k, v in updates.items() if k not in ["id", "password_hash", "_id"]}
    if not safe_updates:
        raise HTTPException(status_code=400, detail="No valid updates")
    await db.users.update_one({"id": user_id}, {"$set": safe_updates})
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@api_router.post("/users/assign-path")
async def assign_path(data: AssignPath, admin: dict = Depends(require_admin)):
    await db.users.update_one({"id": data.user_id}, {"$set": {"assigned_path_id": data.path_id}})
    return {"message": "Path assigned"}

# --- Login Code Management (Admin) ---
@api_router.post("/users/{user_id}/generate-code")
async def generate_login_code(user_id: str, admin: dict = Depends(require_admin)):
    import secrets
    import string
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    charset = string.ascii_uppercase + string.digits
    code = ''.join(secrets.choice(charset) for _ in range(6))
    while await db.login_codes.find_one({"code": code}):
        code = ''.join(secrets.choice(charset) for _ in range(6))
    now = datetime.now(timezone.utc)
    code_doc = {
        "id": str(uuid.uuid4()),
        "code": code,
        "user_id": user_id,
        "user_name": user["name"],
        "user_email": user.get("email", ""),
        "created_by": admin["id"],
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(days=90)).isoformat(),
        "is_active": True,
        "use_count": 0,
        "last_used": None
    }
    await db.login_codes.insert_one(code_doc)
    return {k: v for k, v in code_doc.items() if k != "_id"}

@api_router.get("/login-codes")
async def list_login_codes(admin: dict = Depends(require_admin)):
    codes = await db.login_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return codes

@api_router.delete("/login-codes/{code_id}")
async def revoke_login_code(code_id: str, admin: dict = Depends(require_admin)):
    result = await db.login_codes.update_one({"id": code_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    return {"message": "Code deactivated"}

# --- Module Routes ---
@api_router.get("/modules")
async def list_modules(user: dict = Depends(get_current_user)):
    modules = await db.modules.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return modules

@api_router.get("/modules/{module_id}")
async def get_module(module_id: str, user: dict = Depends(get_current_user)):
    mod = await db.modules.find_one({"id": module_id}, {"_id": 0})
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    return mod

# --- Learning Path Routes ---
@api_router.get("/learning-paths")
async def list_paths(user: dict = Depends(get_current_user)):
    paths = await db.learning_paths.find({}, {"_id": 0}).to_list(100)
    return paths

@api_router.get("/learning-paths/{path_id}")
async def get_path(path_id: str, user: dict = Depends(get_current_user)):
    path = await db.learning_paths.find_one({"id": path_id}, {"_id": 0})
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    return path

@api_router.post("/learning-paths")
async def create_path(data: PathCreate, user: dict = Depends(require_admin)):
    path_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "target_role": data.target_role,
        "module_ids": data.module_ids,
        "certificate_expiry_days": data.certificate_expiry_days,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["id"]
    }
    await db.learning_paths.insert_one(path_doc)
    return {k: v for k, v in path_doc.items() if k != "_id"}

@api_router.put("/learning-paths/{path_id}")
async def update_path(path_id: str, data: PathUpdate, user: dict = Depends(require_admin)):
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    await db.learning_paths.update_one({"id": path_id}, {"$set": updates})
    updated = await db.learning_paths.find_one({"id": path_id}, {"_id": 0})
    return updated

@api_router.delete("/learning-paths/{path_id}")
async def delete_path(path_id: str, user: dict = Depends(require_admin)):
    result = await db.learning_paths.delete_one({"id": path_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Path not found")
    return {"message": "Path deleted"}

# --- Progress Routes ---
@api_router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    progress = await db.user_progress.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return progress

@api_router.get("/progress/user/{user_id}")
async def get_user_progress(user_id: str, admin: dict = Depends(require_admin)):
    progress = await db.user_progress.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return progress

@api_router.put("/progress/module/{module_id}")
async def update_progress(module_id: str, data: ProgressUpdate, user: dict = Depends(get_current_user)):
    mod = await db.modules.find_one({"id": module_id}, {"_id": 0})
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    total_sections = len(mod.get("content", []))
    completed = data.current_section >= total_sections - 1
    existing = await db.user_progress.find_one({"user_id": user["id"], "module_id": module_id})
    now = datetime.now(timezone.utc).isoformat()
    if existing:
        await db.user_progress.update_one(
            {"user_id": user["id"], "module_id": module_id},
            {"$set": {"current_section": data.current_section, "completed": completed, "last_accessed": now, "total_sections": total_sections}}
        )
    else:
        progress_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "module_id": module_id,
            "path_id": user.get("assigned_path_id", ""),
            "current_section": data.current_section,
            "total_sections": total_sections,
            "completed": completed,
            "last_accessed": now
        }
        await db.user_progress.insert_one(progress_doc)
    updated = await db.user_progress.find_one({"user_id": user["id"], "module_id": module_id}, {"_id": 0})
    return updated

# --- Exam Routes ---
@api_router.get("/exams/questions")
async def get_exam_questions(user: dict = Depends(get_current_user)):
    category = user.get("staff_category", "")
    q_doc = await db.questions.find_one({"target_role": category}, {"_id": 0})
    if not q_doc:
        raise HTTPException(status_code=404, detail="No questions found for your role")
    safe_questions = []
    for i, q in enumerate(q_doc["questions"]):
        safe_questions.append({
            "index": i,
            "question": q["question"],
            "options": q["options"],
        })
    return {"target_role": category, "questions": safe_questions, "total": len(safe_questions)}

@api_router.post("/exams/submit")
async def submit_exam(data: ExamSubmit, user: dict = Depends(get_current_user)):
    category = user.get("staff_category", "")
    q_doc = await db.questions.find_one({"target_role": category}, {"_id": 0})
    if not q_doc:
        raise HTTPException(status_code=404, detail="No questions found")
    questions = q_doc["questions"]
    if len(data.answers) != 10:
        raise HTTPException(status_code=400, detail="Must submit exactly 10 answers")
    score = 0
    wrong_modules = set()
    for i, ans in enumerate(data.answers):
        if ans == questions[i]["correct_answer"]:
            score += 1
        else:
            wrong_modules.add(questions[i]["related_module_id"])
    passed = score == 10
    now = datetime.now(timezone.utc).isoformat()
    attempt_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "path_id": data.path_id,
        "score": score,
        "passed": passed,
        "modules_to_review": list(wrong_modules),
        "attempted_at": now
    }
    await db.exam_attempts.insert_one(attempt_doc)
    result = {"score": score, "total": 10, "passed": passed, "attempt_id": attempt_doc["id"]}
    if passed:
        path = await db.learning_paths.find_one({"id": data.path_id}, {"_id": 0})
        expiry_days = path.get("certificate_expiry_days", 365) if path else 365
        cert_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "user_name": user["name"],
            "path_id": data.path_id,
            "path_name": path["name"] if path else "Unknown",
            "target_role": category,
            "issued_at": now,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=expiry_days)).isoformat()
        }
        await db.certificates.insert_one(cert_doc)
        result["certificate_id"] = cert_doc["id"]
    else:
        mod_names = []
        for mid in wrong_modules:
            m = await db.modules.find_one({"id": mid}, {"_id": 0})
            if m:
                mod_names.append(m["title"])
        result["modules_to_review"] = mod_names
    return result

@api_router.get("/exams/attempts")
async def get_attempts(user: dict = Depends(get_current_user)):
    attempts = await db.exam_attempts.find({"user_id": user["id"]}, {"_id": 0}).sort("attempted_at", -1).to_list(50)
    return attempts

# --- Certificate Routes ---
@api_router.get("/certificates")
async def list_certificates(user: dict = Depends(get_current_user)):
    query = {} if user["role"] == "admin" else {"user_id": user["id"]}
    certs = await db.certificates.find(query, {"_id": 0}).sort("issued_at", -1).to_list(500)
    return certs

@api_router.get("/certificates/{cert_id}/download")
async def download_certificate(cert_id: str):
    cert = await db.certificates.find_one({"id": cert_id}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    buffer = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    # Background
    c.setFillColor(HexColor("#FBFDF9"))
    c.rect(0, 0, width, height, fill=1, stroke=0)
    # Border
    c.setStrokeColor(HexColor("#006C4C"))
    c.setLineWidth(3)
    c.roundRect(20, 20, width - 40, height - 40, 15, fill=0, stroke=1)
    c.setStrokeColor(HexColor("#89F8C6"))
    c.setLineWidth(1.5)
    c.roundRect(30, 30, width - 60, height - 60, 12, fill=0, stroke=1)
    # Header
    c.setFillColor(HexColor("#006C4C"))
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 70, "I CAN SCHOOL")
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#4D6357"))
    c.drawCentredString(width / 2, height - 88, "Health & Safety Training Portal")
    # Title
    c.setFillColor(HexColor("#006C4C"))
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width / 2, height - 140, "Certificate of Completion")
    # Body
    c.setFillColor(HexColor("#404944"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 185, "This is to certify that")
    c.setFillColor(HexColor("#002114"))
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, height - 220, cert["user_name"])
    c.setFillColor(HexColor("#404944"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 252, "has successfully completed the")
    c.setFillColor(HexColor("#006C4C"))
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 280, cert["path_name"])
    c.setFillColor(HexColor("#404944"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 310, "with a perfect score of 10/10 on the final assessment")
    # Date
    issued = cert["issued_at"][:10]
    expires = cert["expires_at"][:10]
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 345, f"Date of Completion: {issued}    |    Valid Until: {expires}")
    # Signature
    c.setStrokeColor(HexColor("#006C4C"))
    c.setLineWidth(0.8)
    c.line(width / 2 - 120, height - 400, width / 2 + 120, height - 400)
    c.setFillColor(HexColor("#002114"))
    c.setFont("Helvetica-Oblique", 14)
    c.drawCentredString(width / 2, height - 390, "Dr. Christoforos Drousiotis")
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#4D6357"))
    c.drawCentredString(width / 2, height - 415, "Health & Safety Lead / Primary Medical Responder")
    c.drawCentredString(width / 2, height - 430, "I CAN SCHOOL")
    # Footer
    c.setFont("Helvetica", 8)
    c.setFillColor(HexColor("#707973"))
    c.drawCentredString(width / 2, 45, f"Certificate ID: {cert['id']}")
    c.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="certificate_{cert_id}.pdf"'}
    )

@api_router.delete("/certificates/{cert_id}")
async def revoke_certificate(cert_id: str, admin: dict = Depends(require_admin)):
    result = await db.certificates.delete_one({"id": cert_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"message": "Certificate deleted"}

# --- Staff Edit Route ---
class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    staff_category: Optional[str] = None
    is_active: Optional[bool] = None

@api_router.put("/users/{user_id}/edit")
async def edit_staff(user_id: str, data: StaffUpdate, admin: dict = Depends(require_admin)):
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    if "email" in updates:
        existing = await db.users.find_one({"email": updates["email"], "id": {"$ne": user_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    if "staff_category" in updates:
        path = await db.learning_paths.find_one({"target_role": updates["staff_category"]}, {"_id": 0})
        if path:
            updates["assigned_path_id"] = path["id"]
    await db.users.update_one({"id": user_id}, {"$set": updates})
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated

# --- Invite Staff Route ---
class InviteStaff(BaseModel):
    email: str
    name: str
    staff_category: str

@api_router.post("/users/invite")
async def invite_staff(data: InviteStaff, admin: dict = Depends(require_admin)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    import secrets
    temp_password = secrets.token_urlsafe(8)
    role_to_path = {}
    paths = await db.learning_paths.find({}, {"_id": 0}).to_list(100)
    for p in paths:
        role_to_path[p["target_role"]] = p["id"]
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "password_hash": hash_password(temp_password),
        "name": data.name,
        "role": "staff",
        "staff_category": data.staff_category,
        "assigned_path_id": role_to_path.get(data.staff_category),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "invited": True
    }
    await db.users.insert_one(user_doc)
    return {
        "message": f"Staff invited successfully",
        "user_id": user_doc["id"],
        "temp_password": temp_password,
        "email": data.email,
        "name": data.name
    }

# --- Analytics Routes (Admin) ---
@api_router.get("/analytics/overview")
async def analytics_overview(admin: dict = Depends(require_admin)):
    total_staff = await db.users.count_documents({"role": "staff"})
    total_certs = await db.certificates.count_documents({})
    total_attempts = await db.exam_attempts.count_documents({})
    passed_attempts = await db.exam_attempts.count_documents({"passed": True})
    categories = await db.users.aggregate([
        {"$match": {"role": "staff"}},
        {"$group": {"_id": "$staff_category", "count": {"$sum": 1}}}
    ]).to_list(20)
    cat_stats = {c["_id"]: c["count"] for c in categories if c["_id"]}
    now = datetime.now(timezone.utc)
    expiring_soon = await db.certificates.count_documents({
        "expires_at": {"$lte": (now + timedelta(days=30)).isoformat(), "$gt": now.isoformat()}
    })
    return {
        "total_staff": total_staff,
        "total_certificates": total_certs,
        "total_attempts": total_attempts,
        "passed_attempts": passed_attempts,
        "pass_rate": round((passed_attempts / total_attempts * 100) if total_attempts > 0 else 0, 1),
        "category_breakdown": cat_stats,
        "expiring_soon": expiring_soon
    }

@api_router.get("/analytics/staff-progress")
async def staff_progress_analytics(admin: dict = Depends(require_admin)):
    staff = await db.users.find({"role": "staff"}, {"_id": 0, "password_hash": 0}).to_list(500)
    result = []
    for s in staff:
        progress = await db.user_progress.find({"user_id": s["id"]}, {"_id": 0}).to_list(100)
        completed = sum(1 for p in progress if p.get("completed"))
        path = None
        if s.get("assigned_path_id"):
            path = await db.learning_paths.find_one({"id": s["assigned_path_id"]}, {"_id": 0})
        total_modules = len(path["module_ids"]) if path else 6
        pct = round((completed / total_modules * 100) if total_modules > 0 else 0, 1)
        attempts = await db.exam_attempts.count_documents({"user_id": s["id"]})
        cert = await db.certificates.find_one({"user_id": s["id"]}, {"_id": 0}, sort=[("issued_at", -1)])
        result.append({
            **s,
            "modules_completed": completed,
            "total_modules": total_modules,
            "progress_pct": pct,
            "exam_attempts": attempts,
            "certificate": cert
        })
    return result

# --- Resources Routes ---
@api_router.get("/resources")
async def list_resources(user: dict = Depends(get_current_user)):
    resources = await db.resources.find({}, {"_id": 0}).to_list(50)
    return resources

# --- Root ---
@api_router.get("/")
async def root():
    return {"message": "I CAN SCHOOL Health & Safety Portal API"}

# --- Startup ---
from seed_data import seed_database

@app.on_event("startup")
async def startup():
    await seed_database(db)
    logger.info("Database seeded successfully")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
