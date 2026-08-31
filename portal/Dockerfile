# REGISTRY_MIRROR lets us pull base images through a mirror. Default empty = Docker Hub.
ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}node:20-alpine AS deps
WORKDIR /app
# The lockfile's `resolved` URLs point at npmmirror, so `npm ci` works on China networks.
COPY package.json package-lock.json ./
RUN npm ci

ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
