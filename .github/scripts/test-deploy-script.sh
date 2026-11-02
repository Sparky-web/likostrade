#!/usr/bin/env bash
set -euo pipefail

script="${1:-$(dirname "$0")/deploy-on-server.sh}"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/home/.config/selectel-deploy" "$fixture/project" "$fixture/bin"
: > "$fixture/home/.config/selectel-deploy/build.env"
: > "$fixture/project/.env"
cat > "$fixture/bin/docker" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$DEPLOY_TEST_CALLS"
# Имитируем команду, которая забирает весь доступный stdin.
cat >/dev/null
MOCK
for command in nice ionice; do
  cat > "$fixture/bin/$command" <<'MOCK'
#!/bin/sh
shift 2
exec "$@"
MOCK
done
printf '#!/bin/sh\nexit 0\n' > "$fixture/bin/flock"
chmod +x "$fixture/bin/"*
sed "s|/tmp/selectel-deploy.lock|$fixture/deploy.lock|" "$script" > "$fixture/script.sh"
HOME="$fixture/home" PATH="$fixture/bin:$PATH" DEPLOY_TEST_CALLS="$fixture/calls" \
  bash -s -- "$fixture/project" test-revision < "$fixture/script.sh"
test "$(cat "$fixture/project/.deploy-revision")" = test-revision
grep -q '^builder prune -f --filter until=168h$' "$fixture/calls"
echo 'Deployment script completes even when docker reads stdin'
