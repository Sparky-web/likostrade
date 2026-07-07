# syntax=docker/dockerfile:1
# Прод-образ likostrade. Собирается ПРЯМО НА СЕРВЕРЕ (без реестра), исходники доставляет rsync из Actions.
# Postgres — на хосте, контейнер ходит в него через host.docker.internal (см. docker-compose.yml).
# Загрузки (public/uploads) монтируются томом с хоста — в образ не кладутся.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl нужен движку Prisma (debian-openssl-3.0.x)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
COPY . .
# Серверный env читается лениво в рантайме (SKIP_ENV_VALIDATION); SKIP_LINT обходит флейки-линт next build.
RUN SKIP_ENV_VALIDATION=1 SKIP_LINT=1 pnpm build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
# Билд и рантайм на одной базе (bookworm) → Prisma-движок native совпадает. Копируем готовое приложение целиком.
COPY --from=build /app ./
RUN chmod +x docker/entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker/entrypoint.sh"]
