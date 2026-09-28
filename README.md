# Patient Case-Taking and Medical Record Management System

A centralized, web-based digital healthcare record management application designed to replace paper-based hospital medical files with a secure, full-stack digital workflow.

---

## 📌 1. Project Overview

Manual, paper-based patient case-taking suffers from illegible handwriting, misplaced files, lack of allergy warnings, and slow record retrieval. The **Patient Case-Taking & Medical Record Management System** solves this by providing a digital repository for clinical case-taking, doctor consultations, vital signs tracking, long-term medical history, allergy alerts, medication prescribing, and follow-up management.

---

## ✨ 2. Key Features

- **Public Healthcare Landing Page**: Overview of features, system architecture, and quick-fill viva demo buttons.
- **Role-Based Security**: Separate authorization for **Admin**, **Doctor**, and **Patient** with JWT tokens and bcrypt password hashing.
- **Patient Registration & Intake**: Auto-generated Patient Codes (`PAT-2026-001`), DOB age auto-calculation, blood group, emergency contact details.
- **Visual Allergy Warnings**: High-visibility allergy banners displayed prominently on patient profiles to prevent clinical drug interaction errors.
- **Clinical Case-Taking Module**: Records chief complaints, symptom duration, severity, family history, and lifestyle factors.
- **Doctor Consultation Workspace**: Captures vital signs (BP, Temp, Pulse, SpO2, Weight), clinical notes, primary & secondary diagnosis, treatment plan, and a multi-row medication prescriber.
- **Follow-up Management**: Scheduled, Completed, Missed, and Cancelled status tracking with filtering for *Today*, *This Week*, *Upcoming*, and *Completed*.
- **Global Patient Lookup**: Instant search by Patient ID, Full Name, or Phone Number.

---

## 🛠️ 3. Technology Stack

- **Frontend**: React.js 19, Vite, Tailwind CSS, Lucide React Icons, React Router DOM
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, CORS
- **Database**: Dual-Mode Database Engine:
  - **Local**: Embedded zero-config SQLite (`better-sqlite3`)
  - **Cloud Production**: PostgreSQL (`pg`) for Supabase / Neon / Render

---

## 🏗️ 4. Project Directory Structure

```text
patient-medical-record-system/
│
├── frontend/                     # React.js + Vite Client Application
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, Modal, ConfirmDialog, StatCard, Toast
│   │   ├── context/             # AuthContext (JWT & state management)
│   │   ├── pages/               # LandingPage, Login, Admin, Doctor, Patient, Consultations, etc.
│   │   ├── services/            # API client (Fetch + VITE_API_URL support)
│   │   └── App.jsx              # Protected Routing & Layout Wrapper
│   ├── package.json
│   ├── vercel.json              # SPA routing rewrite for Vercel
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API Server
│   ├── db/                      # Database connection driver & seed script
│   ├── middleware/              # JWT authentication & role authorization
│   ├── routes/                  # REST API endpoints (Auth, Patients, Consultations, etc.)
│   ├── .env.example             # Environment variable template
│   ├── index.js                 # Express server entrypoint
│   └── package.json
│
├── database/                    # Database Migrations & SQL Schemas
│   └── schema.sql               # PostgreSQL Schema Definition
│
├── vercel.json                  # Root deployment configuration
├── .gitignore                   # Ignores secrets, node_modules, build artifacts, sqlite files
├── .env.example                 # Root environment variables template
├── package.json                 # Root script runner (concurrently)
└── README.md                    # Project documentation
```

---

## 🔑 5. Demo Account Credentials (For Viva & Evaluation)

| Role | Email Address | Password | Name / Description |
|---|---|---|---|
| **Admin** | `admin@medrecord.com` | `admin123` | System Administrator |
| **Doctor** | `dr.smith@medrecord.com` | `doctor123` | Dr. Sarah Smith (Cardiology) |
| **Doctor** | `dr.johnson@medrecord.com` | `doctor123` | Dr. Robert Johnson (Internal Med) |
| **Patient** | `john.doe@gmail.com` | `patient123` | John Doe (`PAT-2026-001`) |
| **Patient** | `jane.smith@gmail.com` | `patient123` | Jane Smith (`PAT-2026-002`) |

---

## ⚙️ 6. Environment Variables Reference

Create `.env` files based on the `.env.example` templates:

### Root & Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_med_record_sys_2026

# Optional: Set DATABASE_URL to connect to Cloud PostgreSQL (Supabase / Neon / Render).
# Omit DATABASE_URL for zero-config embedded SQLite database.
DATABASE_URL=postgresql://username:password@hostname:5432/dbname
CLIENT_ORIGIN=http://localhost:5173,https://your-app.vercel.app
```

### Frontend (`frontend/.env`):
```env
# Leave empty for local development (uses Vite proxy /api -> http://localhost:5000)
# Set to your deployed backend URL in production
VITE_API_URL=https://your-backend-service.onrender.com/api
```

---

## 💻 7. Local Development Setup

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/patient-medical-record-system.git
cd patient-medical-record-system

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Run Development Servers
From the root directory:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🗄️ 8. Database Setup

### Local Execution (SQLite Zero-Config)
No database installation is required! When `DATABASE_URL` is omitted in `backend/.env`, the server automatically creates `backend/db/database.sqlite` and populates realistic demo data.

### Cloud PostgreSQL / Supabase Setup
1. Create a project on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Open the SQL Editor and run the contents of [`database/schema.sql`](file:///e:/project/database/schema.sql).
3. Copy your database connection string and set `DATABASE_URL` in your backend environment variables.

---

## 🚀 9. GitHub & Deployment Instructions

### A. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Patient Case-Taking and Medical Record System"
git branch -M main
git remote add origin https://github.com/your-username/patient-medical-record-system.git
git push -u origin main
```

### B. Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository (`patient-medical-record-system`).
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-api.onrender.com/api`
6. Click **Deploy**. Vercel will build and deploy your frontend application.

### C. Deploy Backend to Render / Railway

1. Sign up on [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** connected to your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node index.js`.
6. Add Environment Variables:
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `CLIENT_ORIGIN`: `https://your-frontend.vercel.app`
   - `DATABASE_URL`: `postgresql://...` (your Supabase PostgreSQL URL)
7. Deploy the backend service and copy its public URL into your frontend `VITE_API_URL`.

---

## ✅ 10. Production Checklist

- [x] Sensitive secrets excluded via `.gitignore` (`.env`, `node_modules`, `*.sqlite`).
- [x] Environment template files created (`.env.example`).
- [x] Dual-mode DB driver supports SQLite locally & PostgreSQL in production.
- [x] Dynamic API URL routing via `import.meta.env.VITE_API_URL`.
- [x] Configurable CORS rules.
- [x] SPA routing rewrite rules configured in `frontend/vercel.json`.
- [x] Verified build compilation (`npm run build`).

---

## 🔮 11. Future Enhancements

- Integration of DICOM Medical Imaging viewer for Radiology scans.
- Telemedicine video consultation link integration.
- SMS / WhatsApp automated appointment reminders.
