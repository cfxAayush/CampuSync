# 🎓 CampuSync

A modern, full-stack campus placement & career portal built to streamline job applications, student profile management, and recruitment pipeline tracking for university placement officers.

## 🚀 Tech Stack

- **Frontend**: React 19 (Vite), React Router, Lucide Icons, Modern Glassmorphic CSS
- **Backend**: Python, Django 5, Django REST Framework, SimpleJWT
- **Database**: SQLite3 (Local) / PostgreSQL (Production)
- **Deployment**: Vercel (Frontend) & Render (Backend)

---

## ✨ Features

- 🔐 **Role-Based Authentication**: JWT-based authentication for Students and Placement Officers / Admins.
- 💼 **Job Applications**: Search, filter, and apply for open company positions.
- 📊 **Placement Dashboard**: Real-time stats on placement rates, active applications, and job listings.
- 🔄 **Application Pipeline**: Multi-stage candidate tracking (`Applied` ➔ `In Review` ➔ `Interviewing` ➔ `Selected` / `Rejected`) with officer feedback.
- 📄 **Resume PDF Management**: Instant upload, preview, and download of candidate resumes.

---

## 🔑 Demo Access Credentials

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Placement Officer (Admin)** | `admin_officer` | `adminpassword123` | Create/edit jobs, manage candidate application pipeline, add notes, view placement stats & analytics |
| **Student** | `student_demo` | `studentpassword123` | Search jobs, filter positions, submit 1-click applications, upload resume PDF, track application status |

---

## 🛠️ Local Development Setup

### Backend Setup (Django)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python seed.py  # Seed initial demo jobs, users, and applications
python manage.py runserver
```

Run test suite:
```bash
python manage.py test api
```

### Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Live Deployment Walkthrough

### 1. Backend on Render (Web Service)
1. Link your GitHub repository on [Render](https://render.com).
2. Create a new **Web Service** with:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `gunicorn placement_portal.wsgi:application`
3. Environment Variables on Render:
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<generate-a-random-secret-key>`
   - `ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`

### 2. Frontend on Vercel
1. Link your GitHub repository on [Vercel](https://vercel.com).
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
3. Environment Variables on Vercel:
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com/api`
   - `VITE_SERVER_URL`: `https://<your-render-app>.onrender.com`
4. Click **Deploy**.
