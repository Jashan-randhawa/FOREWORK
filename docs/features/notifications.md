# Notifications & Communications (Phase 6)

## 1. Transactional Email Wrapper & Templates (NOTIFY-001)

### Overview
- **Location**: `Backend/utils/mailer.js`.
- **Environment Handling**: In test and development environments without configured SMTP/transactional credentials, `sendEmail` logs the payload and resolves safely with a mock message ID (`mock-${Date.now()}`), preventing pipeline or execution failures.
- **Production Integration**: Ready for SMTP or transactional API providers (Resend, AWS SES, Postmark).

### Email Workflows & Templates
1. **Email Verification (`sendVerificationEmail`)**:
   - Sent on user registration (or manual resend).
   - Contains secure SHA-256 hashed one-time token link expiring in 24 hours.
2. **Password Reset (`sendPasswordResetEmail`)**:
   - Sent on password recovery request.
   - Contains secure one-time token link expiring in 1 hour.
3. **Interview Scheduling (`sendInterviewInvitationEmail`)**:
   - Sent when a recruiter schedules an interview via `POST /api/application/:id/schedule`.
   - Includes formatted interview date/time and direct meeting URL.
4. **Application Submitted (`sendApplicationSubmittedEmail`)**:
   - Sent to candidate upon applying to a job posting via `POST /api/application/apply/:id`.
   - Confirms job title, company name, and review status.
5. **New Applicant Notification (`sendNewApplicantNotificationEmail`)**:
   - Sent to recruiter when a candidate submits an application.
   - Highlights applicant name and position title, prompting recruiter review.
6. **Application Status Update (`sendApplicationStatusEmail`)**:
   - Sent to candidate when recruiter updates their application status to `accepted` or `rejected`.
   - Distinct messaging and color highlights based on outcome.

---

## 2. Event Hooks in Application Lifecycle (NOTIFY-002)

### Automated Event Triggers
- **`POST /api/application/apply/:id`**:
  - Sends `sendApplicationSubmittedEmail` to candidate.
  - Sends `sendNewApplicantNotificationEmail` to job creator (recruiter).
  - Creates `APPLICATION_SUBMITTED` in-app notification for candidate.
  - Creates `NEW_APPLICANT` in-app notification for recruiter.
- **`POST /api/application/status/:id/update`**:
  - Sends `sendApplicationStatusEmail` to candidate.
  - Creates `APPLICATION_STATUS` in-app notification for candidate.
- **`POST /api/application/:id/schedule`**:
  - Sends `sendInterviewInvitationEmail` to candidate.
  - Creates `INTERVIEW_SCHEDULED` in-app notification for candidate.

---

## 3. In-App Notification System & Data Architecture (NOTIFY-003)

### Notification Data Model (`Backend/models/notification.model.js`)
```javascript
{
  recipient: { type: ObjectId, ref: "User", required: true, index: true },
  sender:    { type: ObjectId, ref: "User", default: null },
  type: {
    type: String,
    enum: [
      "APPLICATION_SUBMITTED",
      "NEW_APPLICANT",
      "APPLICATION_STATUS",
      "INTERVIEW_SCHEDULED",
      "JOB_ALERT",
      "SYSTEM"
    ],
    required: true,
    index: true
  },
  title:     { type: String, required: true, trim: true },
  message:   { type: String, required: true, trim: true },
  link:      { type: String, default: "" },
  isRead:    { type: Boolean, default: false, index: true },
  metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

Compound Index:
`{ recipient: 1, isRead: 1, createdAt: -1 }` ensures fast paginated retrieval and instantaneous unread count calculation.

### API Reference (`/api/notification` and `/api/v1/notification`)
All endpoints are protected by `authenticateToken` and strictly scoped to `req.id`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notification` | Paginated list of notifications for the logged-in user (`?page=1&limit=15&unreadOnly=true`). Populates sender info. |
| `GET` | `/api/notification/unread-count` | Quick count of unread notifications for badge rendering. |
| `PATCH` | `/api/notification/:id/read` | Marks a single notification as read (scoped to owner). Also supports `PUT`, `POST`. |
| `PATCH` | `/api/notification/read-all` | Marks all notifications for current user as read. Also supports `PUT`, `POST`. |
| `DELETE` | `/api/notification/:id` | Deletes a notification (scoped to owner). |

---

## 4. Frontend Notification Experience

### `NotificationDropdown.jsx`
- Integrated into `Navbar.jsx` when user is authenticated.
- **Bell Icon with Unread Badge**:
  - Displays dynamic red count badge when `unreadCount > 0`.
  - Animates subtly to draw attention to incoming updates.
- **Interactive Popover Dropdown**:
  - Header displays unread counter and "Mark all read" button.
  - Scrollable notification list with distinct visual styling for unread items.
  - Relative time timestamps (`just now`, `5m ago`, `2h ago`).
  - Click-to-navigate action automatically marks notification as read and directs user to relevant page (`/profile`, `/recruiter/jobs/:id/applicants`, etc.).
  - Hover action allows deletion of individual notifications.
  - Elegant empty state when no notifications are present.
- **Polling & Refresh**:
  - Automatically fetches unread count on mount and refreshes every 30 seconds.
  - Refetches full notification list on dropdown open.
