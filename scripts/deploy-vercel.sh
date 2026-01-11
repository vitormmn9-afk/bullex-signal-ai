#!/usr/bin/env bash
set -euo pipefail

# Simple Vercel deploy script for bullex-signal-ai
# - Ensures Vercel CLI is available
# - Guides login via device flow
# - Adds secrets from .env
# - Links the project and deploys to production

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/6] Checking Vercel CLI..."
if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing globally via npm..."
  npm i -g vercel
fi

echo "[2/6] Logging into Vercel (device flow)..."
echo "If prompted, open https://vercel.com/device and enter the code."
vercel login || true

# Parse .env values
SUPABASE_URL=""
SUPABASE_ANON=""
if [[ -f .env ]]; then
  # Read lines and strip quotes
  while IFS='=' read -r key value; do
    value="${value%\r}"
    value="${value%\n}"
    value="${value%\"}"
    value="${value#\"}"
    case "$key" in
      VITE_SUPABASE_URL) SUPABASE_URL="$value" ;;
      VITE_SUPABASE_ANON_KEY) SUPABASE_ANON="$value" ;;
    esac
  done < .env
fi

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON" ]]; then
  echo "[WARN] Missing Supabase values in .env. You can add secrets manually:"
  echo "  vercel secrets add supabase_url <YOUR_URL>"
  echo "  vercel secrets add supabase_anon_key <YOUR_ANON_KEY>"
else
  echo "[3/6] Adding Vercel secrets for Supabase..."
  # Add/Update secrets (idempotent)
  vercel secrets rm supabase_url >/dev/null 2>&1 || true
  vercel secrets rm supabase_anon_key >/dev/null 2>&1 || true
  vercel secrets add supabase_url "$SUPABASE_URL"
  vercel secrets add supabase_anon_key "$SUPABASE_ANON"
fi

echo "[4/6] Linking project to Vercel..."
vercel link --yes

echo "[5/6] Building production..."
npm run build --silent

echo "[6/6] Deploying to production..."
vercel deploy --prod --yes --cwd .
