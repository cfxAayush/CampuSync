from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import JobPosting, Application

User = get_user_model()

class PlacementDeskAPITests(APITestCase):
    def setUp(self):
        # 1. Create Admin Placement Officer
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.edu',
            password='testpassword123',
            role=User.Role.ADMIN,
            is_staff=True
        )

        # 2. Create Student User
        self.student_user = User.objects.create_user(
            username='student_test',
            email='student@test.edu',
            password='testpassword123',
            role=User.Role.STUDENT,
            cgpa=9.10,
            department='Computer Science & Engineering'
        )

        # 3. Create Sample Job Posting
        self.job = JobPosting.objects.create(
            title='Software Engineer - Backend',
            company='Stripe Inc',
            location='Remote',
            job_type='Full-Time',
            salary='Rs. 20,00,000 CTC',
            description='Build robust payment infrastructure and high-throughput APIs.',
            requirements='Proficiency in Python/Django and relational databases.',
            posted_by=self.admin_user,
            is_active=True
        )

    def test_student_registration(self):
        """Test student self-registration endpoint"""
        url = reverse('register')
        data = {
            'username': 'new_student',
            'email': 'newstudent@test.edu',
            'password': 'password12345',
            'confirm_password': 'password12345',
            'first_name': 'Aarav',
            'last_name': 'Sharma',
            'role': 'STUDENT',
            'department': 'Information Technology',
            'cgpa': 8.5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='new_student').exists())
        user = User.objects.get(username='new_student')
        self.assertEqual(user.role, User.Role.STUDENT)

    def test_jwt_login(self):
        """Test JWT token generation and role claim payload"""
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin_test',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'ADMIN')

    def test_job_creation_rbac(self):
        """Test that only Admins can create jobs, students get 403 Forbidden"""
        url = reverse('job_list_create')
        job_data = {
            'title': 'Frontend Engineer',
            'company': 'Vercel',
            'location': 'Remote',
            'job_type': 'Full-Time',
            'salary': 'Rs. 18,00,000 CTC',
            'description': 'React UI engineer',
            'requirements': 'React and Tailwind',
            'is_active': True
        }

        # Student should be forbidden
        self.client.force_authenticate(user=self.student_user)
        res_student = self.client.post(url, job_data, format='json')
        self.assertEqual(res_student.status_code, status.HTTP_403_FORBIDDEN)

        # Admin should succeed
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.post(url, job_data, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JobPosting.objects.count(), 2)

    def test_student_job_application_and_duplicate_prevention(self):
        """Test applying to a job and verify unique constraint prevents duplicate applications"""
        url = reverse('job_apply', kwargs={'pk': self.job.id})

        # Authenticate as student
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'APPLIED')
        self.assertEqual(Application.objects.count(), 1)

        # Attempt duplicate application -> Should be rejected with 400 Bad Request
        duplicate_response = self.client.post(url)
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Application.objects.count(), 1)

    def test_admin_application_pipeline_update(self):
        """Test admin updating candidate status through the recruitment pipeline"""
        # Create an application
        application = Application.objects.create(
            job=self.job,
            student=self.student_user,
            status=Application.Status.APPLIED
        )

        url = reverse('application_status_update', kwargs={'pk': application.id})

        # Update status to INTERVIEWING with notes
        self.client.force_authenticate(user=self.admin_user)
        update_data = {
            'status': Application.Status.INTERVIEWING,
            'notes': 'Selected for round 2 technical assessment.'
        }
        response = self.client.patch(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        application.refresh_from_db()
        self.assertEqual(application.status, Application.Status.INTERVIEWING)
        self.assertEqual(application.notes, 'Selected for round 2 technical assessment.')

    def test_placement_stats_endpoint(self):
        """Test analytics/metrics calculation for placement office dashboard"""
        # Create applications with different statuses
        Application.objects.create(job=self.job, student=self.student_user, status=Application.Status.SELECTED)

        url = reverse('placement_stats')
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_jobs'], 1)
        self.assertEqual(response.data['total_applications'], 1)
        self.assertEqual(response.data['total_students'], 1)
        self.assertEqual(response.data['status_counts']['SELECTED'], 1)
        self.assertEqual(response.data['placement_rate'], 100.0)
