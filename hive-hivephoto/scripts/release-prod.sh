#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Running predeploy checks..."
npm run predeploy:check

echo "Deploying HivePhoto to production..."
npx --yes vercel --prod --yes --scope saggarsonny-3909s-projects