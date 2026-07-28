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

    # Clear existing non-superuser data
    Application.objects.all().delete()
    JobPosting.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    # 1. Create Admin / Placement Officers
    admin_user = User.objects.create_user(
        username='admin_officer',
        email='placement@university.edu',
        password='adminpassword123',
        first_name='Dr. Rajesh',
        last_name='Sharma',
        role=User.Role.ADMIN,
        department='Placement Cell',
        phone='+91 98765 43210'
    )
    print(f"[OK] Created Admin: {admin_user.username} (password: adminpassword123)")

    # 2. Create Sample Students
    student1 = User.objects.create_user(
        username='student_demo',
        email='student@university.edu',
        password='studentpassword123',
        first_name='Student',
        last_name='User',
        role=User.Role.STUDENT,
        department='Computer Science & Engineering',
        cgpa=8.95,
        phone='+91 91234 56789'
    )
    
    student2 = User.objects.create_user(
        username='priya_verma',
        email='priya@student.edu',
        password='studentpassword123',
        first_name='Priya',
        last_name='Verma',
        role=User.Role.STUDENT,
        department='Information Technology',
        cgpa=9.12,
        phone='+91 98111 22233'
    )

    student3 = User.objects.create_user(
        username='rohit_kumar',
        email='rohit@student.edu',
        password='studentpassword123',
        first_name='Rohit',
        last_name='Kumar',
        role=User.Role.STUDENT,
        department='Electronics & Comm',
        cgpa=8.20,
        phone='+91 97777 88899'
    )
    print("[OK] Created Demo Students: aayush_student, priya_verma, rohit_kumar (password: studentpassword123)")

    # 3. Create Sample Job Postings
    job1 = JobPosting.objects.create(
        title='Software Engineer - Full Stack (Graduate 2026)',
        company='Google India Cloud',
        location='Bangalore / Hyderabad (Hybrid)',
        job_type='Full-Time',
        salary='Rs. 18,00,000 - 24,00,000 CTC',
        description='Looking for passionate freshers with strong fundamentals in Data Structures, Web Systems (Django/React), REST APIs, and relational databases. You will work on distributed systems and cloud infrastructure.',
        requirements='* B.Tech in CSE/IT/ECE (CGPA > 7.5)\n* Proficiency in Python/JavaScript, Django, React, PostgreSQL/SQLite\n* Strong problem solving and system design basics',
        posted_by=admin_user,
        is_active=True
    )

    job2 = JobPosting.objects.create(
        title='Backend Developer Intern (Python / Django)',
        company='Razorpay Technologies',
        location='Bangalore (On-Site)',
        job_type='Internship',
        salary='Rs. 45,000 / month',
        description='Join our core payments backend team. Help architect scalable microservices, manage payment gateway APIs, and optimize SQL database queries.',
        requirements='* Familiarity with Django REST Framework & SQL DB schema design\n* Knowledge of JWT Authentication & API security\n* Good git workflow skills',
        posted_by=admin_user,
        is_active=True
    )

    job3 = JobPosting.objects.create(
        title='Frontend Engineer - React.js',
        company='Atlassian',
        location='Remote',
        job_type='Full-Time',
        salary='Rs. 22,00,000 CTC',
        description='Build intuitive web applications for developer tools. Focus on state management, responsive UI design, modern JavaScript (ES6+), and seamless API integration.',
        requirements='* Strong proficiency in React, Hooks, Context API / Redux\n* Eye for clean UX design, CSS architecture, and web performance',
        posted_by=admin_user,
        is_active=True
    )

    job4 = JobPosting.objects.create(
        title='Data Analyst Trainee',
        company='Deloitte USI',
        location='Gurugram / Noida',
        job_type='Full-Time',
        salary='Rs. 10,50,000 CTC',
        description='Analyze business metrics, generate visualization dashboards, and write complex SQL data extraction scripts for international enterprise clients.',
        requirements='* Proficiency in SQL, Python, Excel, PowerBI\n* Good communication and analytical skills',
        posted_by=admin_user,
        is_active=True
    )
    job5 = JobPosting.objects.create(
        title='Python Data Analysts',
        company='Capgemini',
        location='Bangalore',
        job_type='Part-Time',
        salary='Rs. 10,80,320 CTC',
        description='Analyze business metrics, generate visualization dashboards, and write complex SQL data extraction scripts for international enterprise clients.',
        requirements='* Proficiency in SQL, Python, Excel, PowerBI\n* Good communication and analytical skills',
        posted_by=admin_user,
        is_active=True
    )
    print("[OK] Created 5 High-Quality Job Listings!")

    # 4. Create Sample Applications across pipeline stages
    app1 = Application.objects.create(
        job=job1,
        student=student1,
        status=Application.Status.INTERVIEWING,
        notes='Cleared Technical Round 1 with high rating on Django DB design.'
    )

    app2 = Application.objects.create(
        job=job2,
        student=student1,
        status=Application.Status.SELECTED,
        notes='Offer letter released. Joining date: August 15th.'
    )

    app3 = Application.objects.create(
        job=job1,
        student=student2,
        status=Application.Status.IN_REVIEW,
        notes='Resume screened, pending technical interview scheduling.'
    )

    app4 = Application.objects.create(
        job=job3,
        student=student3,
        status=Application.Status.APPLIED,
        notes='Application submitted via campus portal.'
    )

    print("[OK] Created Sample Applications across Pipeline Stages!")
    print("\n[SUCCESS] Database Seeding Complete!")

if __name__ == '__main__':
    seed_database()
