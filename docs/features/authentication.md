# Authentication Architecture & Lifecycle

## 1. Email Verification (AUTH-010)

### Design & Lifecycle
1. **Registration / Request**:
   - When a user registers or triggers `POST /api/user/verify-email/resend`, a cryptographically random token is generated via `crypto.randomBytes(32).toString('hex')`.
   - The token is hashed with SHA-256 and stored on the `User` document:
     - `emailVerificationToken`: SHA-256 hash string
     - `emailVerificationExpires`: Date (24 hours expiry)
   - An email is dispatched with the raw token in a link: `/verify-email?token=<raw_token>`.
2. **Verification Endpoint**:
   - `GET /api/user/verify-email?token=<raw_token>` or `POST /api/user/verify-email` with `{ token }`.
   - Computes SHA-256 of the token, looks up `User` where `emailVerificationToken === hashedToken` and `emailVerificationExpires > Date.now()`.
   - On match: sets `isEmailVerified = true`, removes token and expiry fields.
3. **Frontend Experience**:
   - Route `/verify-email` renders `VerifyEmail.jsx`, displaying status indicators and redirects to login once confirmed.

---

## 2. Password Reset (AUTH-011)

### Anti-Enumeration & Security Principles
- **Generic Responses**: `POST /api/user/forgot-password` always returns `HTTP 200` with `"If an account with that email exists, password reset instructions have been sent."`, irrespective of whether the email exists in MongoDB.
- **Hashed Storage**: The raw token is sent exclusively in the email reset link (`/reset-password?token=<raw_token>`). Only the SHA-256 hash is persisted in `passwordResetToken`, with a 1-hour expiry (`passwordResetExpires`).
- **One-Time Use**: Resetting the password clears `passwordResetToken` and `passwordResetExpires`.
- **Rate Limiting**: Password reset and forgot-password endpoints are throttled via `express-rate-limit` (max 5 requests per 15-minute window per IP) to prevent brute-force attacks and abuse.

### API Endpoints
- `POST /api/user/forgot-password`: Initiates password reset. Body: `{ email }`.
- `POST /api/user/reset-password`: Resets password. Body: `{ token, password }`.
- `POST /api/user/verify-email/resend`: Resends verification link. Requires authentication.
- `GET /api/user/verify-email`: Verifies token. Query: `?token=<token>`.
