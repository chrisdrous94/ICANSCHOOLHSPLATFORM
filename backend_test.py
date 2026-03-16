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
                self.run_test(
                    "Test Certificate Download Endpoint",
                    "GET",
                    f"certificates/{cert_id}/download",
                    [200, 404, 400],  # Multiple valid status codes
                    headers=headers
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
    else:
        print("⚠️  Skipping admin-only tests (admin login failed)")
    
    # Print summary
    tester.print_summary()
    
    # Return exit code based on success rate
    success_rate = tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0
    return 0 if success_rate >= 0.8 else 1  # 80% pass rate required

if __name__ == "__main__":
    sys.exit(main())