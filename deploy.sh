#!/bin/bash
set -e

RAILWAY_SERVICE_ID="984eebb8-3571-44fe-bc4f-0dc5d94f34d6"
APP_JS="./app.js"
MODE=${1:-both}  # usage: ./deploy.sh [frontend|backend|both]

if [[ "$MODE" != "frontend" && "$MODE" != "backend" && "$MODE" != "both" ]]; then
  echo "Usage: ./deploy.sh [frontend|backend|both]"
  exit 1
fi

echo "🚀 Deploying: $MODE"

# ── Backend ──
if [[ "$MODE" == "backend" || "$MODE" == "both" ]]; then
  echo ""
  echo "📦 Deploying backend to Railway..."
  railway up --detach --service $RAILWAY_SERVICE_ID

  echo "⏳ Waiting for Railway to be ready..."
  sleep 15

  RAILWAY_URL=$(railway domain --service $RAILWAY_SERVICE_ID 2>/dev/null | grep "URL:" | awk '{print $2}')
  if [ -z "$RAILWAY_URL" ]; then
    RAILWAY_URL="https://selector-production-b208.up.railway.app"
    echo "⚠️  Could not fetch Railway URL, using existing: $RAILWAY_URL"
  else
    echo "✅ Railway URL: $RAILWAY_URL"
  fi

  echo ""
  echo "🔧 Updating API URL in app.js..."
  sed -i '' "s|: 'https://.*\.up\.railway\.app'|: '$RAILWAY_URL'|g" $APP_JS
  sed -i '' "s|: 'https://.*\.ngrok-free\.app'|: '$RAILWAY_URL'|g" $APP_JS
  echo "✅ app.js updated with: $RAILWAY_URL"
fi

# ── Frontend ──
if [[ "$MODE" == "frontend" || "$MODE" == "both" ]]; then
  echo ""
  echo "📝 Writing vercel.json..."
  cat > vercel.json <<'EOF'
{
  "version": 2,
  "builds": [
    { "src": "**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
EOF
  echo "✅ vercel.json ready"

  echo ""
  echo "🌐 Deploying frontend to Vercel..."
  VERCEL_OUTPUT=$(vercel --prod --yes 2>&1)
  echo "$VERCEL_OUTPUT"

  VERCEL_URL=$(echo "$VERCEL_OUTPUT" | grep "Aliased" | grep -oE 'https://[^ ]+\.vercel\.app' | head -1)
  if [ -z "$VERCEL_URL" ]; then
    VERCEL_URL=$(echo "$VERCEL_OUTPUT" | grep "Production" | grep -oE 'https://[^ ]+\.vercel\.app' | head -1)
  fi

  if [ -z "$VERCEL_URL" ]; then
    echo "⚠️  Could not parse Vercel URL"
  else
    echo "✅ Vercel URL: $VERCEL_URL"
    if [[ "$MODE" == "both" && -n "$RAILWAY_URL" ]]; then
      railway variables set FRONTEND_URL="$VERCEL_URL" --service $RAILWAY_SERVICE_ID
      echo "✅ Railway env updated with FRONTEND_URL"
    fi
  fi
fi

# ── Done ──
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "  ✅ Deployment complete! [$MODE]"
[[ -n "$RAILWAY_URL" ]] && echo "  Backend  → $RAILWAY_URL"
[[ -n "$VERCEL_URL" ]]  && echo "  Frontend → $VERCEL_URL"
echo "╚══════════════════════════════════════════════════════╝"
