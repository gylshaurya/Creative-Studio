# Creative Studio

A project management platform for creative teams.

The backend is Django REST Framework. The frontend is React. Teams can manage projects, assign tasks, track workflow stages, and get notifications when things change.

---

Deployment Link: https://creative-studio-phi.vercel.app/dashboard

## What it does

- Multiple studios with role-based access (Admin, Project Lead, Designer, Writer, Reviewer, Client)
- Projects with types like Poster, Video, Campaign, Content
- Tasks with workflow stages: Draft → Review → Revision → Approved → Completed
- Stage transitions are validated — you can't skip stages
- Notifications when tasks are assigned or stages change
- Comment threads on tasks
- Search and filter tasks by stage, priority, assignee, deadline

---

## Tech stack

**Backend**
- Django 6 + Django REST Framework
- PostgreSQL
- JWT authentication via djangorestframework-simplejwt
- django-filter for filtering and search
- drf-spectacular for auto-generated API docs

**Frontend**
- React + Vite
- React Router for navigation

---

## Project structure

```
creative-studio/
├── backend/
│   ├── config/          # Django settings (base, dev, prod)
│   ├── users/           # Custom user model, auth endpoints
│   ├── studios/         # Studio and membership management, RBAC
│   ├── projects/        # Projects, dashboard
│   ├── tasks/           # Tasks, filters, signals
│   └── notifications/   # Notification model and endpoints
└── frontend/
└── src/
├── api/         # fetch wrapper with JWT handling
├── contexts/    # Auth context
├── components/  # ProtectedRoute
└── pages/       # Login, Register, Dashboard, Projects
```
---

## Getting started

**Prerequisites**
- Python 3.11+
- Node 20+
- A PostgreSQL database (local or Neon)

**Backend setup**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the root with:

```
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Then run:
```bash
python manage.py migrate
python manage.py runserver
```

API runs at `http://127.0.0.1:8000`
Swagger docs at `http://127.0.0.1:8000/api/schema/swagger/`

**Frontend setup**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API overview

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | /api/auth/register/ | Register a new user |
| POST | /api/auth/token/ | Login, get JWT tokens |
| POST | /api/auth/token/refresh/ | Refresh access token |
| GET/PATCH | /api/auth/me/ | Get or update your profile |
| GET/POST | /api/studios/ | List or create studios |
| GET/POST | /api/studios/{id}/members/ | List or invite members |
| PATCH | /api/studios/{id}/members/{id}/ | Change member role |
| GET/POST | /api/studios/{id}/projects/ | List or create projects |
| GET/POST | /api/studios/{id}/projects/{id}/tasks/ | List or create tasks |
| PATCH | /api/studios/{id}/projects/{id}/tasks/{id}/ | Update task or change stage |
| GET | /api/notifications/ | Get your notifications |
| PATCH | /api/notifications/{id}/ | Mark notification as read |
| GET | /api/dashboard/ | Dashboard data |

---

## Team

Built by Shaurya(maverick) and Siddhi(siddhi)