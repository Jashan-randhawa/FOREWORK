# 🛡️ Admin Governance Console

The Admin Console provides platform owners with governance, moderation, trust & safety enforcement, and forensic auditing capabilities.

---

## 👥 User Governance (`AdminUsers.jsx`)

- **User Directory**: Search and filter all registered platform users by role (`Student`, `Recruiter`, `Admin`).
- **Account Actions**:
  - Suspend bad actors, spam recruiters, or fraudulent candidates.
  - Reinstate suspended accounts after compliance verification.
  - Promote or demote user roles.

---

## 🏢 Company & Job Moderation (`AdminCompanies.jsx`, `AdminJobs.jsx`)

- **Enterprise Verification**: Inspect business credentials, domains, and registration details to grant official verified status.
- **Listing Moderation**: Quarantine or delete fraudulent job postings, spam, or scam listings violating trust and safety guidelines.

---

## 🔍 Forensic Audit Logs (`AdminAuditLogs.jsx`)

ForeWork logs every sensitive administrative and security-critical action into an immutable audit collection:

### Log Record Schema
- **Action**: `USER_SUSPENDED`, `COMPANY_VERIFIED`, `JOB_DELETED`, `ROLE_UPDATED`.
- **Actor**: Administrator ID, email, and IP address.
- **Target**: Entity ID, entity type, and previous state.
- **Timestamp**: ISO 8601 UTC timestamp.
- **Metadata**: Request origin, browser agent, and contextual rationale.

### Mobile Presentation
On mobile viewports, the audit log transforms into an interactive **Timeline View** with collapsible event cards and status badges.