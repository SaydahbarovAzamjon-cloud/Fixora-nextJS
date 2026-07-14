#!/usr/bin/env bash
set -e

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy .env.example to .env.local and fill values"
  exit 1
fi

# Production must not bake localhost API URLs into the client bundle.
read_env() {
  grep -E "^${1}=" .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'"'" | tr -d ' '
}

GRAPHQL_URL="$(read_env NEXT_PUBLIC_GRAPHQL_URL)"
API_URL="$(read_env NEXT_PUBLIC_API_URL)"

for label in "NEXT_PUBLIC_GRAPHQL_URL" "NEXT_PUBLIC_API_URL"; do
  val="$(read_env "$label")"
  if [[ -z "$val" ]]; then
    echo "ERROR: $label is missing in .env.local"
    exit 1
  fi
  if [[ "$val" == *localhost* ]] || [[ "$val" == *127.0.0.1* ]]; then
    echo "ERROR: $label must not point to localhost for production deploy."
    echo "  Current: $val"
    echo "  Expected: https://fixoranext.com/graphql (GraphQL) and https://fixoranext.com (API base)"
    exit 1
  fi
done

if grep -qE '^GRAPHQL_PROXY_TARGET=' .env.local; then
  echo "WARN: GRAPHQL_PROXY_TARGET is set — remove it on production (proxy is for local dev only)."
fi

echo "Building with GraphQL → $GRAPHQL_URL"
echo "Building with API base → $API_URL"

yarn install --frozen-lockfile
yarn build
export NODE_ENV=production
docker compose down
docker compose up -d
