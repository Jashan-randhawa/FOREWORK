# Administration & Moderation (Phase 5)

## 1. Admin Role & Account Security (ADMIN-001)

### Role Distinction & Boundary
- **Role Model**: The `User` model now supports 3 roles: `Student`, `Recruiter`, and `Admin`.
- **Public Registration Protection**: The public registration endpoint (`POST /api/user/register`) strictly rejects any attempt to register with `role === "Admin"` with `403 Forbidden` (`"Admin accounts cannot be created via public registration"`).
- **Secure Provisioning**: Admin accounts can only be provisioned through secure infrastructure seeding scripts:
  - `Backend/scripts/seed-admin.js`: Creates or updates a dedicated administrative user securely.
  - `Backend/scripts/seed.js`: Complete environment seed script provisioning admins, recruiters, and candidates with appropriate dummy data.

### Account Suspension Lifecycle
- **Field**: `User.isSuspended` (Boolean, default `false`, indexed).
- **Login Enforcement**: Suspended users attempting authentication via `POST /api/user/login` are rejected with `403 Forbidden` (`"Your account has been suspended. Please contact support."`).
- **Active Token Enforcement**: Authenticated requests passing through `authenticateToken` (`Backend/middleware/isAuthenticated.js`) verify user suspension in real-time. If a user is suspended after token issuance, all subsequent requests are blocked with `403 Forbidden` (`"Account is suspended"`).

---

## 2. Moderation APIs & Workflows (ADMIN-002)

All admin endpoints are mounted at `/api/admin/*` and `/api/v1/admin/*`, protected by `authenticateToken` and `requireRole("Admin")`.

### Overview Platform Statistics
- `GET /api/admin/stats`
- Returns aggregate metrics for platform health:
  - `totalUsers`, `totalStudents`, `totalRecruiters`
  - `totalJobs`
  - `totalCompanies`
  - `totalApplications`
  - `recentAuditLogs` (most recent 5 actions)

### User Management & Moderation
- `GET /api/admin/users`:
  - Query parameters: `?page=1&limit=10&role=Student|Recruiter|Admin&search=<query>`.
  - PII (passwords, encrypted aadhaar/pan cards) are excluded from responses.
- `PATCH /api/admin/users/:id/status` (also supports `PUT`, `POST`):
  - Suspends or unsuspends user accounts.
  - Request body: `{ isSuspended: boolean, reason?: string }`.
  - Admins cannot suspend their own accounts (returns `400 Bad Request`).

### Job Moderation
- `GET /api/admin/jobs`:
  - Query parameters: `?page=1&limit=10&status=draft|published|paused|expired|closed&search=<query>`.
  - Populates company information and poster identity.
- `PATCH /api/admin/jobs/:id/status` / `PATCH /api/admin/jobs/:id/moderate` (also supports `PUT`, `POST`):
  - Updates job status directly.
  - Request body: `{ status: string, reason?: string }`.
- `DELETE /api/admin/jobs/:id`:
  - Removes inappropriate or spam job postings along with associated applications.
  - Request body: `{ reason?: string }`.

### Company Moderation
- `GET /api/admin/companies`:
  - Query parameters: `?page=1&limit=10&isVerified=true|false&search=<query>`.
  - Populates owner user profile.
- `PATCH /api/admin/companies/:id/verify` (also supports `PUT`, `POST`):
  - Verifies or un-verifies company entities.
  - Request body: `{ isVerified: boolean, reason?: string }`.

---

## 3. Audit Logging System (ADMIN-003)

### AuditLog Schema (`Backend/models/auditLog.model.js`)
```javascript
{
  actor: { type: ObjectId, ref: "User", required: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, enum: ["User", "Job", "Company", "Application"], required: true, index: true },
  targetId: { type: ObjectId, required: true, index: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
}
```

### Logged Events
- `USER_SUSPENDED` / `USER_UNSUSPENDED`
- `JOB_STATUS_CHANGED`
- `JOB_REMOVED`
- `COMPANY_VERIFIED` / `COMPANY_UNVERIFIED`

### Audit Trail Querying
- `GET /api/admin/audit-logs`:
  - Query parameters: `?page=1&limit=20&action=<action>&targetType=<type>`.
  - Populates actor details (`fullname`, `email`, `role`).
  - Strict RBAC: Only accessible by users with role `Admin`.

---

## 4. Frontend Route Architecture & Admin Experience (ADMIN-004)

### Route Disambiguation & Namespace Separation
To eliminate route collisions between Recruiter management tools and Platform Administration:
- **Recruiter routes** moved to `/recruiter/*`:
  - `/recruiter/companies`
  - `/recruiter/companies/create`
  - `/recruiter/companies/:id`
  - `/recruiter/jobs`
  - `/recruiter/jobs/create`
  - `/recruiter/jobs/:id/applicants`
- **Admin routes** reserved for `/admin/*`:
  - `/admin/dashboard` - Platform metrics and quick moderation overview
  - `/admin/users` - User directory, role filtering, suspension toggles
  - `/admin/jobs` - Job moderation, status updates, removal actions
  - `/admin/companies` - Company verification badges and directory
  - `/admin/audit-logs` - System-wide audit trail with targetType filters

### Security Guards (`AdminRoute.jsx`)
- Client-side route protection ensuring:
  - User is authenticated.
  - User has `user.role === "Admin"`.
  - Non-admins attempting navigation to `/admin/*` are immediately redirected to `/`.
