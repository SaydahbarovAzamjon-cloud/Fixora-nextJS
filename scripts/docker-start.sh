#!/usr/bin/env bash
# Start fixora-next inside node:20 image (no custom Docker image).
# Skips yarn install / next build when host volume already has node_modules + .next.
set -euo pipefail

if [[ ! -d node_modules ]]; then
  echo "[docker] node_modules missing — running yarn install (one-time)"
  yarn install --frozen-lockfile
fi

if [[ ! -d .next ]]; then
  echo "[docker] .next missing — building on host first is faster: bash deploy.sh"
  yarn build
fi

exec yarn next start -p 3000 -H 0.0.0.0
