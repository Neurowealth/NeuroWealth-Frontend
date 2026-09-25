# syntax=docker/dockerfile:1

# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# ── Stage 3: production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ── Required environment variables at docker run time ─────────────────────────
# The following NEXT_PUBLIC_* variables are baked into the client bundle at
# build time (they can't be injected at runtime). They MUST be provided as
# --build-arg flags when running `docker build`, not as -e flags at runtime.
#
# If you only have the pre-built image and need to override these values,
# rebuild from source with the correct ARG values.
#
# Required for the application to start without crashing (see instrumentation.ts):
#   NEXT_PUBLIC_API_URL         — backend REST API base URL
#   NEXT_PUBLIC_WEBHOOK_URL     — webhook receiver endpoint
#
# Optional but expected (see .env.example for the full list):
#   NEXT_PUBLIC_APP_URL         — canonical public URL of this deployment
#   NEXT_PUBLIC_STELLAR_NETWORK — "testnet" or "mainnet"
#   NEXT_PUBLIC_STELLAR_HORIZON_URL — Stellar Horizon endpoint
#
# Example build command (supply all required build args):
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     --build-arg NEXT_PUBLIC_WEBHOOK_URL=https://hooks.example.com \
#     --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com \
#     -t neurowealth-frontend .
#
# Then run without any extra env flags:
#   docker run -p 3000:3000 neurowealth-frontend

CMD ["node", "server.js"]
