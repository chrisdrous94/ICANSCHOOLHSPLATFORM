# I CAN SCHOOL: Health & Safety Training & Certification Portal - PRD

## Original Problem Statement
Build a complete, production-ready "I CAN SCHOOL: Health & Safety Training & Certification Portal" with Material Design 3 UI, two user roles (Admin/Staff), 6 training modules from the school's H&S protocol, 10-question exams requiring 100% pass rate, PDF certificate generation, drag-and-drop path builder, immersive reader mode, and compliance tracking.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + @dnd-kit + Recharts
- **Backend**: FastAPI + Motor (async MongoDB) + PyJWT + bcrypt + ReportLab
- **Database**: MongoDB (collections: users, modules, learning_paths, user_progress, exam_attempts, certificates, questions, resources)

## User Personas
1. **Administrator** (Dr. Christoforos Drousiotis) - Manages staff, builds learning paths, views analytics, issues/revokes certificates
2. **Staff** (Teachers, Security Guards, Kitchen Staff, Extra-Curricular Staff, Reception Staff, First Aid Team) - Completes training, takes exams, downloads certificates

## Core Requirements (Static)
- JWT-based authentication with bcrypt password hashing
- Role-based access control (admin/staff)
- 6 curriculum modules with 8 sections each (48 total content sections)
- 10 scenario-based questions per staff role (60 total questions)
- Strict 100% (10/10) pass requirement for certification
- Failure shows modules to review, NOT correct answers
- PDF certificate generation with Dr. Drousiotis digital signature
- Drag-and-drop learning path builder
- Immersive reader with progress saving
- Quick Resources Vault (emergency contacts, Appendix A form, DRABC reference)
- Compliance expiry tracking (365-day default)

## What's Been Implemented (March 2026)
- [x] Complete Material Design 3 UI with green tonal palette
- [x] Login page with hero section and demo credentials
- [x] Admin Dashboard with analytics (bar chart, pie chart, compliance overview)
- [x] Admin Path Builder with drag-and-drop module ordering
- [x] Admin Staff Directory with search, filter, progress tracking, path assignment
- [x] Staff Dashboard with greeting, progress bar, locked/unlocked modules
- [x] Immersive Module Reader with section navigation and progress saving
- [x] 10-Question Exam Engine with strict 100% pass rule
- [x] Certificate Page with PDF download and admin revoke capability
- [x] Resources Vault with emergency contacts, forms, and references
- [x] Full seed data: 6 modules, 60 questions, 6 default paths, admin + 6 staff accounts
- [x] PDF certificate generation with ReportLab (Dr. Drousiotis signature)
- [x] All backend API endpoints functional (19 endpoints)
- [x] Responsive design (mobile + desktop)

## Prioritized Backlog
### P0 - Complete
### P1 - Next Phase
- [ ] Compliance expiry email notifications
- [ ] Exam attempt history view for staff
- [ ] Admin ability to edit/add questions
- [ ] Password reset flow
### P2 - Future
- [ ] Bulk staff import (CSV)
- [ ] Training completion reports (PDF export)
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Print-friendly resource pages

## Next Tasks
1. Add compliance notification system (expiry alerts)
2. Admin question editor for customizing exams
3. Password reset functionality
4. Exam history/attempts log view for individual staff
