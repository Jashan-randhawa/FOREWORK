# Production Deployment and Containerization Guide (Phase 9)

## 1. Overview
Phase 9 readies FOREWORK for containerized, resilient production deployment on cloud infrastructure (e.g., Render, Railway, AWS ECS, Kubernetes).

Key operational capabilities:
- **Production Multi-Stage Dockerfile** (`Backend/Dockerfile`)
- **Container Build Optimization** (`Backend/.dockerignore`)
- **Graceful Process Shutdown** (`Backend/index.js` with SIGTERM/SIGINT listeners)
- **Comprehensive End-to-End Integration Suite** (`Backend/tests/phase9.test.js`)
- **Standardized Environment Manifests** (`Backend/.env.example` & `Frontend/.env.example`)

---

## 2. Docker Architecture

### Multi-Stage Build Strategy
The Backend container utilizes a dual-stage Alpine build:
1. `dependencies` stage: Installs production npm packages (`npm ci --omit=dev`) with clean cache.
2. `runner` stage: Runs on minimal `node:20-alpine`, creates an unprivileged system user (`appuser:nodejs`), copies production assets, and drops root privileges.

### Built-in Container Healthcheck
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1
```
Monitors service availability without external dependencies.

### Local Docker Run
```bash
# Build Backend Image
docker build -t forework-backend:latest ./Backend

# Run Container
docker run -d \
  --name forework-backend \
  -p 5001:5001 \
  --env-file ./Backend/.env \
  forework-backend:latest
```

---

## 3. Graceful Shutdown & Connection Draining

When container orchestrators terminate pods or scale down replicas:
1. Orchestrator issues `SIGTERM`.
2. Express server stops accepting new incoming HTTP requests via `server.close()`.
3. In-flight requests are allowed to complete.
4. Mongoose database connection closes cleanly (`mongoose.connection.close(false)`).
5. A 10-second safety timeout forcefully terminates the process if lingering sockets remain unclosed.

---

## 4. Test Suite Execution & Coverage

### Run Vitest Suite (All 9 Phases)
```bash
cd Backend
npm test
```

### Run Vitest Coverage
```bash
cd Backend
npm run test:coverage
```
