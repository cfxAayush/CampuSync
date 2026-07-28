import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement_portal.settings')
django.setup()

from api.models import User, JobPosting, Application

def seed_database():
    print("[+] Seeding Placement Portal Database...")

    # 1. Create/Ensure Admin Officer with ADMIN role
    admin_user, _ = User.objects.get_or_create(
        username='admin_officer',
        defaults={
            'email': 'placement@university.edu',
            'first_name': 'Dr. Rajesh',
            'last_name': 'Sharma',
            'department': 'Placement Cell',
            'phone': '+91 98765 43210'
        }
    )
    admin_user.role = User.Role.ADMIN
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.set_password('adminpassword123')
    admin_user.save()
    print(f"[OK] Admin User verified: {admin_user.username} (Role: {admin_user.role})")

    # 2. Create/Ensure Students
    student1, _ = User.objects.get_or_create(
        username='student_demo',
        defaults={
            'email': 'student@university.edu',
            'first_name': 'Student',
            'last_name': 'User',
            'department': 'Computer Science & Engineering',
            'cgpa': 8.95,
            'phone': '+91 91234 56789',
            'resume': 'resumes/pdf_2.pdf'
        }
    )
    student1.role = User.Role.STUDENT
    student1.set_password('studentpassword123')
    student1.save()

    student2, _ = User.objects.get_or_create(
        username='priya_verma',
        defaults={
            'email': 'priya@student.edu',
            'first_name': 'Priya',
            'last_name': 'Verma',
            'department': 'Information Technology',
            'cgpa': 9.12,
            'phone': '+91 98111 22233',
            'resume': 'resumes/pdf_2.pdf'
        }
    )
    student2.role = User.Role.STUDENT
    student2.set_password('studentpassword123')
    student2.save()

    student3, _ = User.objects.get_or_create(
        username='rohit_kumar',
        defaults={
            'email': 'rohit@student.edu',
            'first_name': 'Rohit',
            'last_name': 'Kumar',
            'department': 'Electronics & Comm',
            'cgpa': 8.20,
            'phone': '+91 97777 88899',
            'resume': 'resumes/pdf_2.pdf'
        }
    )
    student3.role = User.Role.STUDENT
    student3.set_password('studentpassword123')
    student3.save()
    print("[OK] Demo Students verified: student_demo, priya_verma, rohit_kumar")

    # 3. Create Sample Jobs
    job1, _ = JobPosting.objects.get_or_create(
        title='Software Engineer - Full Stack (Graduate 2026)',
        company='Google India Cloud',
        defaults={
            'location': 'Bangalore / Hyderabad (Hybrid)',
            'job_type': 'Full-Time',
            'salary': 'Rs. 18,00,000 - 24,00,000 CTC',
            'description': 'Looking for passionate freshers with strong fundamentals in Data Structures, Web Systems (Django/React), REST APIs, and relational databases. You will work on distributed systems and cloud infrastructure.',
            'requirements': '* B.Tech in CSE/IT/ECE (CGPA > 7.5)\n* Proficiency in Python/JavaScript, Django, React, PostgreSQL/SQLite\n* Strong problem solving and system design basics',
            'posted_by': admin_user,
            'is_active': True
        }
    )

    job2, _ = JobPosting.objects.get_or_create(
        title='Backend Developer Intern (Python / Django)',
        company='Razorpay Technologies',
        defaults={
            'location': 'Bangalore (On-Site)',
            'job_type': 'Internship',
            'salary': 'Rs. 45,000 / month',
            'description': 'Join our core payments backend team. Help architect scalable microservices, manage payment gateway APIs, and optimize SQL database queries.',
            'requirements': '* Familiarity with Django REST Framework & SQL DB schema design\n* Knowledge of JWT Authentication & API security\n* Good git workflow skills',
            'posted_by': admin_user,
            'is_active': True
        }
    )

    job3, _ = JobPosting.objects.get_or_create(
        title='Frontend Engineer - React.js',
        company='Atlassian',
        defaults={
            'location': 'Remote',
            'job_type': 'Full-Time',
            'salary': 'Rs. 22,00,000 CTC',
            'description': 'Build intuitive web applications for developer tools. Focus on state management, responsive UI design, modern JavaScript (ES6+), and seamless API integration.',
            'requirements': '* Strong proficiency in React, Hooks, Context API / Redux\n* Eye for clean UX design, CSS architecture, and web performance',
            'posted_by': admin_user,
            'is_active': True
        }
    )

    job4, _ = JobPosting.objects.get_or_create(
        title='Data Analyst Trainee',
        company='Deloitte USI',
        defaults={
            'location': 'Gurugram / Noida',
            'job_type': 'Full-Time',
            'salary': 'Rs. 10,50,000 CTC',
            'description': 'Analyze business metrics, generate visualization dashboards, and write complex SQL data extraction scripts for international enterprise clients.',
            'requirements': '* Proficiency in SQL, Python, Excel, PowerBI\n* Good communication and analytical skills',
            'posted_by': admin_user,
            'is_active': True
        }
    )

    job5, _ = JobPosting.objects.get_or_create(
        title='Python Data Analysts',
        company='Capgemini',
        defaults={
            'location': 'Bangalore',
            'job_type': 'Part-Time',
            'salary': 'Rs. 10,80,320 CTC',
            'description': 'Analyze business metrics, generate visualization dashboards, and write complex SQL data extraction scripts for international enterprise clients.',
            'requirements': '* Proficiency in SQL, Python, Excel, PowerBI\n* Good communication and analytical skills',
            'posted_by': admin_user,
            'is_active': True
        }
    )
    print(f"[OK] Job Listings verified ({JobPosting.objects.count()} total jobs)")

    # 4. Create Sample Applications
    Application.objects.get_or_create(
        job=job1,
        student=student1,
        defaults={
            'status': Application.Status.INTERVIEWING,
            'notes': 'Cleared Technical Round 1 with high rating on Django DB design.'
        }
    )

    Application.objects.get_or_create(
        job=job2,
        student=student1,
        defaults={
            'status': Application.Status.SELECTED,
            'notes': 'Offer letter released. Joining date: August 15th.'
        }
    )

    Application.objects.get_or_create(
        job=job1,
        student=student2,
        defaults={
            'status': Application.Status.IN_REVIEW,
            'notes': 'Resume screened, pending technical interview scheduling.'
        }
    )

    Application.objects.get_or_create(
        job=job3,
        student=student3,
        defaults={
            'status': Application.Status.APPLIED,
            'notes': 'Application submitted via campus portal.'
        }
    )

    print(f"[OK] Candidate Applications verified ({Application.objects.count()} total applications)")
    print("[SUCCESS] Database Seeding Complete!")

if __name__ == '__main__':
    seed_database()
