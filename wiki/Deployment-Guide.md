# 🚢 Deployment & Production Guide

This guide details how to deploy ForeWork to production across Vercel, Render, and Docker.

---

## 🐳 Docker Deployment

ForeWork includes a production-grade, multi-stage Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY Backend/package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY Backend/ ./
EXPOSE 5001
ENV NODE_ENV=production
CMD ["node", "index.js"]
```

### Build & Run

#### Option A: Pull Pre-Built Container from GitHub Packages
```bash
# Pull production image from GitHub Container Registry (GHCR)
docker pull ghcr.io/jashan-randhawa/forework-backend:latest

# Run container with environment file
docker run -d \
  --name forework-api \
  -p 5001:5001 \
  --restart unless-stopped \
  --env-file Backend/.env \
  ghcr.io/jashan-randhawa/forework-backend:latest
```

#### Option B: Build Image Locally
```bash
# Build image
docker build -t forework-api:latest .

# Run container with environment file
docker run -d \
  --name forework-api \
  -p 5001:5001 \
  --restart unless-stopped \
  --env-file Backend/.env \
  forework-api:latest
```

---

## ☁️ Cloud PaaS Deployment

### 1. Backend on Render / Railway
1. Connect GitHub repository `github.com/Jashan-randhawa/FOREWORK`.
2. Configure Root Directory: `Backend`.
3. Build Command: `npm install`.
4. Start Command: `node index.js`.
5. Populate Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FIELD_ENCRYPTION_KEY`
   - `CLOUD_NAME`, `CLOUD_API`, `API_SECRET`
   - `FRONTEND_URL=https://forework.vercel.app,https://forework-mobile.vercel.app`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

> **Multi-Domain**: Comma-separate `FRONTEND_URL` to support multiple frontend deployments (web + mobile). The first URL is used as the primary for email links.

### 2. Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Root Directory: `Frontend`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variable:
   - `VITE_API_URL=https://forework.onrender.com`

---

## 🚦 Production Readiness Checklist

- [x] Multi-domain CORS configured matching production and mobile domains with `*.vercel.app` wildcard
- [x] JWT cookies configured with `SameSite=None` and `Secure=true`
- [x] Bearer token fallback for mobile/native clients
- [x] Extended 30-day mobile sessions via `X-Client: mobile`
- [x] Helmet security headers active
- [x] Gzip compression active (level 6, ≥1024 bytes)
- [x] Rate limiting configured on auth (15 req/15min), apply (30 req/15min), and global (300 req/15min)
- [x] Graceful `SIGTERM`/`SIGINT` shutdown with 10-second safety timeout
- [x] 100% test suite passing (291 tests: 152 backend + 139 frontend)
- [x] PWA offline service worker and manifest verified
- [x] Vercel Speed Insights enabled for real-user monitoring
- [x] Server boot guard refuses startup with missing/default crypto keys
- [x] ATS engine with authenticated Cloudinary resume downloads