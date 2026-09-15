# Analytics & Reporting (Phase 7)

## 1. Per-Job Recruiting Funnel Analytics (ANALYTICS-001)

### Overview & Access Control
- **Endpoint**: `GET /api/job/:id/stats` (and `/api/v1/job/:id/stats`).
- **Authorization**: Reuses authorization middleware from Phase 1 (`authenticateToken`, `requireRole("Recruiter", "Admin")`).
- **Ownership Verification**: Requester must be the creator of the job (`job.created_by.toString() === req.id.toString()`) or have the `Admin` role. Non-owners receive `403 Forbidden`.

### Aggregation Pipeline & Response Metrics
1. **Views Counter (`Job.views`)**:
   - Incremented automatically and atomically whenever `GET /api/job/get/:id` is called.
2. **Total Applications**:
   - Total number of candidate submissions for this position.
3. **Conversion Rate (%)**:
   - Calculated as `(totalApplications / totalViews) * 100` rounded to 2 decimal places.
4. **Status Funnel Breakdown**:
   - MongoDB `$group` aggregation calculating counts for `pending`, `accepted`, and `rejected`.
5. **Applications Over Time**:
   - 30-day historical time-series aggregation grouping applications by date (`%Y-%m-%d`).

```json
{
  "success": true,
  "stats": {
    "jobId": "65b...",
    "title": "Senior Analytics Engineer",
    "company": "Acme Corp",
    "views": 150,
    "totalApplications": 15,
    "conversionRate": 10.0,
    "statusBreakdown": {
      "pending": 5,
      "accepted": 3,
      "rejected": 7
    },
    "applicationsTimeline": [
      { "date": "2026-09-01", "applications": 2 },
      { "date": "2026-09-02", "applications": 4 }
    ]
  }
}
```

---

## 2. Platform-Wide Administration Analytics (ANALYTICS-002)

### Overview & Access Control
- **Endpoint**: `GET /api/admin/stats` (and `/api/v1/admin/stats`).
- **Authorization**: Gated strictly by `authenticateToken` and `requireRole("Admin")`.

### Aggregation Metrics
- **User & Company Volume**:
  - `totalUsers`, `totalStudents`, `totalRecruiters`, `totalAdmins`, `totalCompanies`.
- **Hiring Pipeline Metrics**:
  - `totalJobs`, `totalApplications`, `totalViews`, `conversionRate`.
- **Jobs by Status**:
  - Aggregation of jobs across lifecycle states (`published`, `draft`, `paused`, `expired`, `closed`).
- **Users by Role**:
  - Count of users grouped by `Student`, `Recruiter`, and `Admin`.
- **Growth Time-Series**:
  - `signupsTimeline`: Daily user registrations over the past 30 days.
  - `applicationsTimeline`: Daily application submissions over the past 30 days.
- **Audit Activity**:
  - Most recent 5 privileged administrative events.

---

## 3. Interactive Recharts Dashboards (ANALYTICS-003)

### Recruiter Job Analytics Modal (`JobAnalyticsModal.jsx`)
- Accessible from `AdminJobsTable.jsx` via the job actions popover ("Analytics" button with `TrendingUp` icon).
- **KPI Cards**: Total Views, Applications, Conversion Rate %, Accepted candidates.
- **Funnel Bar Chart**: Color-coded visualization of application statuses (amber for pending, emerald for accepted, red for rejected).
- **Applications Area Chart**: Interactive 30-day timeline showing candidate application velocity.

### Admin Dashboard Analytics (`AdminDashboard.jsx`)
- Integrated into `/admin/dashboard`.
- **Platform Growth Area Chart**: Dual-colored visual timeline tracking daily signups (purple) vs applications (blue).
- **Job Status Distribution Bar Chart**: Visual breakdown of published vs draft vs paused vs closed jobs.
- **Platform Conversion Badge**: Highlighting total job views and aggregate conversion percentage.
