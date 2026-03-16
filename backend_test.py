#!/usr/bin/env python3
"""
Backend API Testing Suite for I CAN SCHOOL Health & Safety Portal
Tests all major API endpoints for authentication, modules, exams, certificates, etc.
"""

import requests
import sys
import json
from datetime import datetime

class HealthSafetyAPITester:
    def __init__(self, base_url="https://health-safety-portal-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.staff_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, response_data=None, error=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - Error: {error}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "response_data": response_data,
            "error": error
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if success:
                self.log_test(name, True, response_data)
                return True, response_data
            else:
                self.log_test(name, False, error=f"Expected {expected_status}, got {response.status_code}: {response_data}")
                return False, response_data

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, error=f"Request failed: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, error=f"Unexpected error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@icanschool.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_staff_login(self):
        """Test staff login"""
        print("\n👤 Testing Staff Authentication...")
        success, response = self.run_test(
            "Staff Login (Julia)",
            "POST",
            "auth/login",
            200,
            data={"email": "julia@icanschool.com", "password": "staff123"}
        )
        if success and 'token' in response:
            self.staff_token = response['token']
            return True
        return False

    def test_modules_api(self):
        """Test modules endpoints"""
        print("\n📚 Testing Modules API...")
        headers = {'Authorization': f'Bearer {self.staff_token}'} if self.staff_token else {}
        
        # Get all modules
        success, modules = self.run_test(
            "Get All Modules",
            "GET", 
            "modules",
            200,
            headers=headers
        )
        
        if success and isinstance(modules, list) and len(modules) >= 6:
            self.log_test("Modules Count Check (>=6)", True)
            
            # Test getting individual module
            first_module = modules[0]
            module_id = first_module.get('id')
            if module_id:
                self.run_test(
                    f"Get Module Details ({first_module.get('title', 'Unknown')})",
                    "GET",
                    f"modules/{module_id}",
                    200,
                    headers=headers
                )
        else:
            self.log_test("Modules Count Check (>=6)", False, error="Less than 6 modules returned")

    def test_learning_paths_api(self):
        """Test learning paths endpoints"""
        print("\n🛤️  Testing Learning Paths API...")
        headers = {'Authorization': f'Bearer {self.admin_token}'} if self.admin_token else {}
        
        # Get all learning paths
        success, paths = self.run_test(
            "Get All Learning Paths",
            "GET",
            "learning-paths",
            200,
            headers=headers
        )
        
        if success and isinstance(paths, list):
            self.log_test(f"Learning Paths Found ({len(paths)})", True)
            if paths:
                path_id = paths[0].get('id')
                if path_id:
                    self.run_test(
                        "Get Specific Learning Path",
                        "GET",
                        f"learning-paths/{path_id}",
                        200,
                        headers=headers
                    )

    def test_exam_api(self):
        """Test exam endpoints"""
        print("\n📝 Testing Exam API...")
        headers = {'Authorization': f'Bearer {self.staff_token}'} if self.staff_token else {}
        
        # Get exam questions
        success, questions_data = self.run_test(
            "Get Exam Questions",
            "GET",
            "exams/questions",
            200,
            headers=headers
        )
        
        if success and 'questions' in questions_data:
            questions = questions_data['questions']
            if len(questions) >= 10:
                self.log_test("Exam Questions Count (>=10)", True)
                
                # Test submitting exam (with wrong answers)
                wrong_answers = [0] * 10  # All first option (likely wrong)
                self.run_test(
                    "Submit Exam (Test Submission)",
                    "POST",
                    "exams/submit",
                    200,
                    data={"path_id": "test-path", "answers": wrong_answers},
                    headers=headers
                )
            else:
                self.log_test("Exam Questions Count (>=10)", False, error=f"Only {len(questions)} questions found")

    def test_resources_api(self):
        """Test resources endpoints"""
        print("\n📁 Testing Resources API...")
        headers = {'Authorization': f'Bearer {self.staff_token}'} if self.staff_token else {}
        
        self.run_test(
            "Get Resources",
            "GET",
            "resources",
            200,
            headers=headers
        )

    def test_analytics_api(self):
        """Test analytics endpoints (admin only)"""
        print("\n📊 Testing Analytics API...")
        headers = {'Authorization': f'Bearer {self.admin_token}'} if self.admin_token else {}
        
        success, analytics = self.run_test(
            "Get Analytics Overview",
            "GET",
            "analytics/overview",
            200,
            headers=headers
        )
        
        if success:
            required_fields = ['total_staff', 'total_certificates', 'pass_rate', 'category_breakdown']
            missing_fields = [field for field in required_fields if field not in analytics]
            if not missing_fields:
                self.log_test("Analytics Fields Complete", True)
            else:
                self.log_test("Analytics Fields Complete", False, error=f"Missing: {missing_fields}")

    def test_certificates_api(self):
        """Test certificates endpoints"""
        print("\n🏆 Testing Certificates API...")
        headers = {'Authorization': f'Bearer {self.staff_token}'} if self.staff_token else {}
        
        success, certificates = self.run_test(
            "Get Certificates",
            "GET",
            "certificates",
            200,
            headers=headers
        )
        
        # Test certificate download endpoint (should exist but may be empty)
        if success and isinstance(certificates, list) and certificates:
            cert_id = certificates[0].get('id')
            if cert_id:
                # Test download endpoint (may return 404 if no valid cert)
                download_success, download_response = self.run_test(
                    "Test Certificate Download Endpoint",
                    "GET",
                    f"certificates/{cert_id}/download",
                    200,
                    headers=headers
                )
                if download_success and isinstance(download_response, str) and download_response.startswith('%PDF'):
                    self.log_test("Certificate PDF Generation", True)
                
                # Test certificate deletion (admin only - NEW endpoint)
                admin_headers = {'Authorization': f'Bearer {self.admin_token}'} if self.admin_token else {}
                if self.admin_token:
                    self.run_test(
                        "Delete Certificate (Admin)",
                        "DELETE",
                        f"certificates/{cert_id}",
                        200,
                        headers=admin_headers
                    )

    def test_users_api(self):
        """Test user management endpoints (admin only)"""
        print("\n👥 Testing User Management API...")
        headers = {'Authorization': f'Bearer {self.admin_token}'} if self.admin_token else {}
        
        success, users = self.run_test(
            "Get All Users (Admin)",
            "GET",
            "users",
            200,
            headers=headers
        )
        
        if success and isinstance(users, list):
            self.log_test(f"Users List Retrieved ({len(users)} users)", True)
            
            # Test staff invitation (NEW endpoint)
            invite_data = {
                "name": "Test Staff Member",
                "email": f"teststaff_{datetime.now().strftime('%H%M%S')}@icanschool.com",
                "staff_category": "Teachers"
            }
            
            invite_success, invite_response = self.run_test(
                "Invite Staff Member",
                "POST",
                "users/invite",
                200,
                data=invite_data,
                headers=headers
            )
            
            if invite_success and 'temp_password' in invite_response:
                self.log_test("Invite Response Contains Temp Password", True)
                invited_user_id = invite_response.get('user_id')
                
                # Test edit staff member (NEW endpoint)
                if invited_user_id:
                    edit_data = {
                        "name": "Updated Test Staff",
                        "email": invite_data['email'],
                        "staff_category": "Security Guards"
                    }
                    
                    self.run_test(
                        "Edit Staff Member",
                        "PUT",
                        f"users/{invited_user_id}/edit",
                        200,
                        data=edit_data,
                        headers=headers
                    )
                    
                    # Test delete staff member (NEW endpoint)
                    self.run_test(
                        "Delete Staff Member",
                        "DELETE",
                        f"users/{invited_user_id}",
                        200,
                        headers=headers
                    )
            else:
                self.log_test("Invite Response Contains Temp Password", False, error="No temp_password in response")

    def test_login_codes_api(self):
        """Test login code generation and authentication endpoints (NEW FEATURE)"""
        print("\n🔑 Testing Login Codes API...")
        headers = {'Authorization': f'Bearer {self.admin_token}'} if self.admin_token else {}
        
        # Get users first to find a staff member to generate code for
        success, users = self.run_test(
            "Get Users for Code Generation",
            "GET",
            "users",
            200,
            headers=headers
        )
        
        if success and isinstance(users, list):
            # Find a staff member (not admin)
            staff_user = next((user for user in users if user.get('role') == 'staff'), None)
            
            if staff_user:
                staff_user_id = staff_user['id']
                print(f"  📝 Testing code generation for: {staff_user['name']} ({staff_user['email']})")
                
                # Test generate login code
                generate_success, code_response = self.run_test(
                    f"Generate Login Code for {staff_user['name']}",
                    "POST",
                    f"users/{staff_user_id}/generate-code",
                    200,
                    headers=headers
                )
                
                if generate_success and 'code' in code_response:
                    generated_code = code_response['code']
                    code_id = code_response.get('id')
                    
                    # Validate code format (6 uppercase alphanumeric)
                    if len(generated_code) == 6 and generated_code.isupper() and generated_code.isalnum():
                        self.log_test("Generated Code Format (6 uppercase alphanumeric)", True)
                    else:
                        self.log_test("Generated Code Format", False, error=f"Invalid format: {generated_code}")
                    
                    # Validate expiry date is 90 days from now
                    if 'expires_at' in code_response:
                        expires_at = code_response['expires_at']
                        self.log_test("Code Has Expiry Date", True)
                    else:
                        self.log_test("Code Has Expiry Date", False, error="Missing expires_at field")
                    
                    # Test login with the generated code
                    login_success, login_response = self.run_test(
                        f"Login with Generated Code ({generated_code})",
                        "POST",
                        "auth/login-code",
                        200,
                        data={"code": generated_code}
                    )
                    
                    if login_success and 'token' in login_response:
                        self.log_test("Code Login Returns JWT Token", True)
                        # Verify the token is for the correct user
                        if login_response.get('user', {}).get('id') == staff_user_id:
                            self.log_test("Code Login Returns Correct User", True)
                        else:
                            self.log_test("Code Login Returns Correct User", False, error="Wrong user returned")
                    else:
                        self.log_test("Code Login Returns JWT Token", False, error="No token in response")
                    
                    # Test listing all login codes (admin endpoint)
                    list_success, codes_list = self.run_test(
                        "List All Login Codes (Admin)",
                        "GET",
                        "login-codes",
                        200,
                        headers=headers
                    )
                    
                    if list_success and isinstance(codes_list, list):
                        # Find our generated code in the list
                        our_code = next((c for c in codes_list if c.get('code') == generated_code), None)
                        if our_code:
                            self.log_test("Generated Code Appears in List", True)
                            
                            # Check if usage count was updated after login
                            if our_code.get('use_count', 0) >= 1:
                                self.log_test("Code Usage Count Updated", True)
                            else:
                                self.log_test("Code Usage Count Updated", False, error="use_count not incremented")
                        else:
                            self.log_test("Generated Code Appears in List", False, error="Code not found in list")
                    
                    # Test deactivating the code
                    if code_id:
                        deactivate_success, deactivate_response = self.run_test(
                            f"Deactivate Login Code ({generated_code})",
                            "DELETE",
                            f"login-codes/{code_id}",
                            200,
                            headers=headers
                        )
                        
                        if deactivate_success:
                            # Try to login with deactivated code (should fail)
                            login_fail_success, login_fail_response = self.run_test(
                                f"Login with Deactivated Code (should fail)",
                                "POST",
                                "auth/login-code",
                                401,
                                data={"code": generated_code}
                            )
                            
                            if login_fail_success:  # 401 is expected
                                self.log_test("Deactivated Code Login Fails Correctly", True)
                            else:
                                self.log_test("Deactivated Code Login Fails Correctly", False, error="Should have returned 401")
                
                    # Test invalid code login
                    self.run_test(
                        "Login with Invalid Code",
                        "POST",
                        "auth/login-code",
                        401,
                        data={"code": "INVALID"}
                    )
                
                else:
                    self.log_test("Code Generation Response", False, error="No 'code' field in response")
            else:
                self.log_test("Find Staff User for Testing", False, error="No staff user found")
        else:
            self.log_test("Get Users for Code Testing", False, error="Failed to get users list")

    def test_progress_api(self):
        """Test progress endpoints"""
        print("\n📈 Testing Progress API...")
        headers = {'Authorization': f'Bearer {self.staff_token}'} if self.staff_token else {}
        
        self.run_test(
            "Get User Progress",
            "GET",
            "progress",
            200,
            headers=headers
        )

    def test_root_endpoint(self):
        """Test root API endpoint"""
        print("\n🏠 Testing Root Endpoint...")
        self.run_test(
            "API Root",
            "GET",
            "",
            200
        )

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test_name']}: {test['error']}")
        
        print(f"{'='*60}")

def main():
    """Main test runner"""
    print("🚀 Starting I CAN SCHOOL Health & Safety Portal API Tests")
    print("=" * 60)
    
    tester = HealthSafetyAPITester()
    
    # Test root endpoint first
    tester.test_root_endpoint()
    
    # Test authentication
    admin_login_success = tester.test_admin_login()
    staff_login_success = tester.test_staff_login()
    
    if not admin_login_success and not staff_login_success:
        print("❌ CRITICAL: Both admin and staff login failed. Stopping tests.")
        return 1
    
    # Test all API endpoints
    tester.test_modules_api()
    tester.test_learning_paths_api()
    tester.test_exam_api()
    tester.test_resources_api()
    tester.test_certificates_api()
    tester.test_progress_api()
    
    # Admin-only endpoints
    if admin_login_success:
        tester.test_analytics_api()
        tester.test_users_api()
        tester.test_login_codes_api()  # NEW: Test login codes functionality
    else:
        print("⚠️  Skipping admin-only tests (admin login failed)")
    
    # Print summary
    tester.print_summary()
    
    # Return exit code based on success rate
    success_rate = tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0
    return 0 if success_rate >= 0.8 else 1  # 80% pass rate required

if __name__ == "__main__":
    sys.exit(main())