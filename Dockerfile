# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN node scripts/build.mjs

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
