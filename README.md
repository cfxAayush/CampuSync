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

## 🛠️ Local Development Setup

### Backend Setup (Django)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python seed.py  # Optional: Seed initial demo data
python manage.py runserver
```

### Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Deployment Configuration

- **Frontend Environment Variables**: Set `VITE_API_URL` and `VITE_SERVER_URL` in Vercel.
- **Backend Build Script**: Uses `build.sh` on Render for static collection and database migrations.
