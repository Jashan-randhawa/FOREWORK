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
   - `CLOUD_NAME`, `API_KEY`, `API_SECRET`
   - `FRONTEND_URL=https://forework.vercel.app`

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

- [x] Strict CORS configured matching production domain
- [x] JWT cookies configured with `SameSite=None` and `Secure=true`
- [x] Helmet security headers active
- [x] Gzip compression active
- [x] Rate limiting configured on auth and search endpoints
- [x] 100% test suite passing (266 tests across Frontend and Backend)
- [x] PWA offline service worker and manifest verified