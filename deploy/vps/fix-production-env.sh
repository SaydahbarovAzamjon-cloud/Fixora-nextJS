#!/usr/bin/env bash
# Run on VPS inside the FixoraF repo root:
#   bash deploy/vps/fix-production-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

ENV_FILE=".env.local"
TEMPLATE="$ROOT/deploy/vps/frontend.env.local"
BACKUP="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE"
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$BACKUP"
  echo "Backed up → $BACKUP"
fi

cp "$TEMPLATE" "$ENV_FILE"

# Preserve OAuth keys from backup if template placeholders were empty
if [[ -f "$BACKUP" ]]; then
  for key in NEXT_PUBLIC_GOOGLE_CLIENT_ID NEXT_PUBLIC_KAKAO_JS_KEY NEXT_PUBLIC_APPLE_CLIENT_ID; do
    old="$(grep -E "^${key}=" "$BACKUP" 2>/dev/null | head -1 | cut -d= -f2- || true)"
    if [[ -n "$old" && "$old" != "" ]]; then
      if grep -qE "^${key}=" "$ENV_FILE"; then
        sed -i "s|^${key}=.*|${key}=${old}|" "$ENV_FILE"
      else
        echo "${key}=${old}" >> "$ENV_FILE"
      fi
    fi
  done
fi

echo "=== $ENV_FILE (production) ==="
grep -E '^(NEXT_PUBLIC_|REACT_APP_)' "$ENV_FILE" || true

if grep -qE '^GRAPHQL_PROXY_TARGET=' "$ENV_FILE" 2>/dev/null; then
  echo "ERROR: GRAPHQL_PROXY_TARGET still present"
  exit 1
fi

echo ""
echo "Running deploy.sh …"
bash deploy.sh
