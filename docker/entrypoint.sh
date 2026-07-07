#!/bin/sh
set -e
# Накат миграций: прод-БД уже забаселайнена (_prisma_migrations есть), test-БД с нуля накатит все миграции.
npx prisma migrate deploy
exec pnpm start
