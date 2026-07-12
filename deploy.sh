#!/usr/bin/env bash
set -e

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy .env.example to .env.local and fill values"
  exit 1
fi

yarn install --frozen-lockfile
yarn build
export NODE_ENV=production
docker compose down
docker compose up -d
