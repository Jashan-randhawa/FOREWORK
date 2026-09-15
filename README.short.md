# 💼 FOREWORK — Job Portal

> 🌐 **Live Demo:** [forework.vercel.app](https://forework.vercel.app) &nbsp;|&nbsp; ⚙️ **API:** [forework.onrender.com](https://forework.onrender.com) &nbsp;|&nbsp; 📖 **Full Docs:** [README.md](./README.md)

A production-ready, full-stack **Job Portal** built with the MERN stack connecting job seekers, recruiters, and platform admins.

---

## 👥 Three Roles

| Role | What they can do |
|------|-----------------|
| **Student / Job Seeker** | Browse & filter jobs, apply with a resume, track status, save jobs, receive in-app notifications, share listings |
| **Recruiter** | Post jobs, manage applicants, schedule interviews, view analytics dashboards (Recharts) |
| **Admin** | Moderate users/jobs/companies, view platform stats, full audit log trail |

---

## ✨ Key Features

- 🔐 JWT auth (HTTP-only cookies) · bcrypt passwords · AES-256-GCM PII encryption (PAN/Aadhaar)
- 📂 Cloudinary file storage (profile photos, resumes, company logos)
- 🔍 Server-side job search with keyword, location, job type, experience and salary filters
- 📋 Job lifecycle management: `draft → published → paused → expired → closed`
- 📊 Per-job analytics: views, applications, conversion rate, status breakdown (Recharts)
- 🔔 In-app notification system (application submitted, status updates, interview scheduled)
- 📧 Transactional email: email verification, password reset, interview scheduling (Nodemailer)
- 🔖 Save jobs · 📤 1-click share (Web Share API / clipboard fallback)
- 🚨 Admin moderation: suspend users, moderate jobs, verify companies, audit logs
- ♿ WCAG accessibility (skip links, ARIA labels, semantic landmarks, Error Boundary)
- 🐳 Docker multi-stage build · Graceful SIGTERM shutdown · Gzip compression
- ✅ 133/133 Vitest tests across 10 suites — CI on every push

---

## 🛠 Tech Stack

**Frontend:** React 18 · Vite · Redux Toolkit · React Router v7 · Tailwind CSS · shadcn/ui · Recharts · Framer Motion

**Backend:** Node.js + Express (ESM) · MongoDB + Mongoose · JWT · bcryptjs · Multer · Cloudinary · Nodemailer

**DevOps:** Docker · GitHub Actions CI · Render · Vercel · Vitest

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Jashan-randhawa/FOREWORK.git
cd FOREWORK

# Backend
cd Backend
cp .env.example .env     # fill in your values (see Environment Variables below)
npm install
npm run dev              # → http://localhost:5001

# Frontend (new terminal)
cd Frontend
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev              # → http://localhost:5173
```

---

## ⚙️ Required Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Server port (default 5001) |
| `CLOUD_NAME` / `CLOUD_API` / `API_SECRET` | Cloudinary credentials |
| `FRONTEND_URL` | Allowed CORS origin |
| `FIELD_ENCRYPTION_KEY` | AES-256-GCM key — run `openssl rand -hex 32` |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials for transactional email |

---

## 🧪 Tests

```bash
cd Backend
npm test    # 133 tests across 10 Vitest suites (all passing)
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | `jashan@gmail.com` | `password123` |
| Recruiter | `recruiter@company.com` | `password123` |

---

## 👨‍💻 Creator & Maintainer

**Jashanpreet Singh** — Full Stack Developer & Project Lead ([@Jashan-randhawa](https://github.com/Jashan-randhawa))

**License:** MIT · [github.com/Jashan-randhawa/FOREWORK](https://github.com/Jashan-randhawa/FOREWORK)
