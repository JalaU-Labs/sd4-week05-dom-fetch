# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY index.html vite.config.js ./
COPY src ./src

RUN pnpm run build

FROM nginx:alpine AS runtime
LABEL org.opencontainers.image.title="sd4-week05-dom-fetch" \
      org.opencontainers.image.description="Week 05 - DOM and Fetch with DummyJSON" \
      org.opencontainers.image.authors="Diego Alejandro Botina" \
      org.opencontainers.image.licenses="MIT"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1