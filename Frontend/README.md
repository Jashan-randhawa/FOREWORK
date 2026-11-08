# 🎨 FOREWORK — Frontend Client

The frontend client for **FOREWORK**, a modern MERN stack recruitment and talent acquisition platform with explainable ATS resume matching, role-based workflows, and progressive web application (PWA) capabilities.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (`react`, `react-dom`)
- **Build Tool**: Vite 6
- **Routing**: React Router v7 (`react-router-dom`)
- **State Management**: Redux Toolkit & `redux-persist`
- **Styling**: Tailwind CSS 3.4 & `shadcn/ui` (Radix UI primitives)
- **Icons & Motion**: Lucide React, Framer Motion
- **Data Visualization**: Recharts (with vendor chunk code-splitting)
- **Testing**: Vitest 5 (`@testing-library/react`, `jsdom`)
- **Performance & Analytics**: Vercel Speed Insights & Analytics

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local configuration:
```env
VITE_API_URL=http://localhost:5001
```

### 3. Run Development Server
```bash
npm run dev
```
The client starts by default on `http://localhost:5173`.

---

## 🧪 Available Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Launch Vite local dev server with HMR |
| `npm run build` | Compile and bundle production assets |
| `npm run lint` | Run ESLint checks across code files |
| `npm run preview` | Locally preview the built production bundle |
| `npm test` | Run Vitest test suite (143 tests across 22 suites) |

---

## 📱 Features

- **Candidate Hub**: Job search with faceted filtering, bookmarking, pre-apply ATS compatibility check, application tracking, and automated email job alerts.
- **Recruiter Suite**: Company profile verification, multi-stage job lifecycle management (`draft` → `published` → `paused` → `expired` → `closed`), ATS applicant scoring breakdown, interview scheduling, and funnel analytics.
- **Admin Console**: User suspension, forensic audit logs, company verification, and listings moderation.
- **Explainable ATS Predictor**: Interactive `/ats` analysis interface with dual score gauges, category breakdowns, matched/missing skill pills, and actionable recommendations.
- **PWA & Mobile**: Offline banner, service worker caching, touch ergonomics, and mobile navigation sheets.
