# Professional Resume Project Section

## Full-Stack College Placement & Job Portal (Placement-Desk)

**Tech Stack:** Python, Django, Django REST Framework (DRF), SimpleJWT, React.js, SQLite, Axios, HTML5/CSS3

---

### Project Summary
Built a role-based college placement and job tracking platform that connects university students with placement officers and corporate recruiters. Engineered role-based authorization, a database-enforced application pipeline, and candidate resume management across Django REST APIs and a React single-page frontend.

---

### Key Engineering Accomplishments

* **Architected Role-Based Access Control (RBAC):** Designed custom DRF permission classes (`IsAdminUserRole`, `IsStudentUserRole`) and decoded JWT token claims (`role`, `user_id`) in Django REST Framework to enforce server-side access boundaries between Student and Admin API endpoints.
* **Enforced Relational Database Integrity:** Configured Django ORM models with explicit foreign key relationships and a `UniqueConstraint(fields=['job', 'student'])` on SQLite database tables to block duplicate job applications at the database query level.
* **Implemented Candidate Application State Machine:** Built a multi-stage status pipeline (`Applied` ➔ `In Review` ➔ `Interviewing` ➔ `Selected` / `Rejected`) with RESTful `PATCH` endpoints for placement officers to manage candidate progression and record interview feedback.
* **Constructed Protected React Routing & State:** Created a unified React frontend using `AuthContext` for JWT storage and `ProtectedRoute` guards to prevent unauthorized route traversal, automatically redirecting students and admins to role-appropriate dashboards.
* **Integrated Document File Uploads:** Configured Django `FileField` storage and static media routing to allow students to attach PDF resumes to their profiles, providing placement officers with instant PDF preview and download capabilities.

---

### Project Highlights for Interviews
- **Database Schema:** SQLite with strict foreign key constraints and composite uniqueness rule (`job_id`, `student_id`).
- **Authentication:** Stateless JWT Token authentication using `djangorestframework-simplejwt`.
- **Frontend Architecture:** Component-based React with custom CSS design tokens, responsive Kanban/tabular candidate pipeline view, and search/filtering.
