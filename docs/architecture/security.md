# Security Architecture & Data Protection

## 1. Threat Model & Overview
FOREWORK handles recruitment and applicant data, including government-issued identification numbers (PAN, Aadhaar) collected during registration. Prior to Phase 1, the platform had zero server-side role or ownership enforcement, exposed plaintext PII on login, and lacked rate limiting and file upload restrictions.

Phase 1 establishes authoritative server-side access controls, data minimization, cryptographic storage protection, and defensible network security posture.

## 2. PII Protection (PAN & Aadhaar)

### Data Minimization
- **API Payloads**: Raw PAN (`pancard`) and Aadhaar (`adharcard`) numbers are stripped from login responses (`sanitizedUser`), profile retrieval, and candidate listings.
- **Client Storage**: The `redux-persist` configuration in `Frontend/src/redux/store.js` uses an `authTransform` that purges `pancard` and `adharcard` before serialization to browser `localStorage`.

### Encryption at Rest (AES-256-GCM)
- Fields are encrypted using `AES-256-GCM` with a 32-byte secret key derived from `process.env.FIELD_ENCRYPTION_KEY`.
- Ciphertexts are stored as serialized strings containing initialization vector, authentication tag, and ciphertext:
  `iv:authTag:ciphertext`
- Randomized IVs prevent ciphertext comparison attacks.

### Blind Indexing for Uniqueness Checks
- Because AES-256-GCM produces non-deterministic ciphertexts, duplicate prevention queries rely on HMAC-SHA256 blind indexes:
  - `pancardHash = HMAC-SHA256(normalize(pancard), key)`
  - `adharcardHash = HMAC-SHA256(normalize(adharcard), key)`
- Blind indexes are indexed in MongoDB with unique constraints, enabling collision rejection at constant lookup time without decrypting the dataset.

## 3. Server-Side Access Control (RBAC & IDOR Mitigation)

### Layered Middleware Architecture
1. `authenticateToken` (`Backend/middleware/isAuthenticated.js`):
   - Verifies JWT in HTTP-only cookie.
   - Loads authenticated user account and binds `req.id` and `req.user`.
2. `requireRole(...roles)` (`Backend/middleware/requireRole.js`):
   - Asserts `req.user.role` is in the allowed whitelist; otherwise aborts with `403 Forbidden`.
3. Object-Level Ownership Middleware (`Backend/middleware/requireOwnership.js`):
   - `requireCompanyOwnership`: Asserts `company.userId == req.id`.
   - `requireJobOwnership`: Asserts `job.created_by == req.id`.
   - `requireApplicationOwnership`: Asserts `application.job.created_by == req.id`.

### Cross-Site Request Forgery (CSRF) Mitigation
- Application submission (`/api/application/apply/:id`) was converted from `GET` to `POST`.
- Third-party embeds (`<img>`, `<link>`) can no longer trigger state mutations.

## 4. Input & Upload Validation
- `Backend/middleware/multer.js` enforces a 5MB maximum file size.
- Dedicated upload filters:
  - `photoUpload`: `image/jpeg`, `image/png`, `image/webp`.
  - `logoUpload`: `image/jpeg`, `image/png`, `image/webp`.
  - `resumeUpload`: `application/pdf`.
- Disallowed MIME types are rejected with HTTP 400 before passing to Cloudinary.

## 5. Network & DoS Protection
- `helmet`: Sets baseline security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, CSP).
- `express-rate-limit`:
  - `/api/user/login`: 15 requests / 15 min per IP.
  - `/api/user/register`: 15 requests / 15 min per IP.
  - `/api/application/apply`: 30 requests / 15 min per IP.
  - `/api`: Global limit of 300 requests / 15 min per IP.
