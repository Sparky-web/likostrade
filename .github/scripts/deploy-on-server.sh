#!/usr/bin/env bash
set -euo pipefail

project_dir="${1:?project directory is required}"
revision="${2:?revision is required}"
cd "$project_dir"
test -f .env

# Один сервер обслуживает несколько репозиториев. Не собираем образы одновременно.
exec 9>/tmp/selectel-deploy.lock
flock 9

# Секрет прокси хранится вне Git и Docker build context.
set -a
source "$HOME/.config/selectel-deploy/build.env"
set +a
nice -n 10 ionice -c 3 docker compose build --build-arg HTTPS_PROXY --build-arg HTTP_PROXY </dev/null
docker compose up -d --no-build </dev/null

healthy=false
for attempt in {1..30}; do
  if docker compose exec -T app node -e 'fetch("http://127.0.0.1:3000/", {signal: AbortSignal.timeout(5000)}).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))' </dev/null >/dev/null 2>&1; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  docker compose logs --tail=60
  echo "Application health check failed" >&2
  exit 1
fi
printf '%s\n' "$revision" > .deploy-revision
docker image prune -f </dev/null
docker builder prune -f --filter until=168h </dev/null
