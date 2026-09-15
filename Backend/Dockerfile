# Multi-stage production build for Node.js 20 Backend
FROM node:20-alpine AS dependencies
WORKDIR /usr/src/app

# Install dependencies needed for compiling if any (or ca-certificates)
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Production runner stage
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5001

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production node_modules from dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copy application source
COPY . .

# Set correct ownership
RUN chown -R appuser:nodejs /usr/src/app

# Switch to non-root user
USER appuser

EXPOSE 5001

# Production health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

CMD ["node", "index.js"]
