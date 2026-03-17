#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_PID_FILE="$ROOT_DIR/.frontend-dev.pid"
FRONTEND_LOG_FILE="$ROOT_DIR/.frontend-dev.log"

wait_for_http() {
  local url="$1"
  local name="$2"
  local retries="${3:-30}"
  local sleep_seconds="${4:-1}"

  for _ in $(seq 1 "$retries"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[ok] $name is ready: $url"
      return 0
    fi
    sleep "$sleep_seconds"
  done

  echo "[err] $name did not become ready: $url"
  return 1
}

echo "[1/4] Building backend jar..."
cd "$BACKEND_DIR"
chmod +x mvnw

# Retry once for transient repackage/archive-read failures.
build_ok=false
for attempt in 1 2; do
  if ./mvnw clean package -DskipTests; then
    build_ok=true
    break
  fi
  echo "[warn] Backend build failed (attempt $attempt)."
  if [[ "$attempt" -lt 2 ]]; then
    echo "[info] Retrying backend build..."
  fi
done

if [[ "$build_ok" != true ]]; then
  echo "[err] Backend build failed after retries."
  exit 1
fi

echo "[2/4] Starting backend + database with Docker Compose..."
cd "$ROOT_DIR"
# Çakışan container'ları temizle (farklı compose'dan kalmış olabilir)
docker rm -f efsora-postgres efsora-backend 2>/dev/null || true
docker compose up -d

echo "[3/4] Starting frontend dev server on port 5173..."
if ss -ltn 2>/dev/null | grep -q ':5173 '; then
  echo "[info] Port 5173 is already in use. Reusing existing frontend process."
else
  cd "$FRONTEND_DIR"
  nohup npm run dev -- --host 0.0.0.0 --port 5173 >"$FRONTEND_LOG_FILE" 2>&1 &
  echo $! >"$FRONTEND_PID_FILE"
  echo "[info] Frontend PID: $(cat "$FRONTEND_PID_FILE")"
fi

echo "[4/4] Verifying services..."
wait_for_http "http://localhost:8080/api/kullanicilar/health" "Backend API" 60 1
wait_for_http "http://localhost:5173" "Frontend" 30 1

echo

echo "Application is up:"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:8080"
echo "- Swagger:  http://localhost:8080/swagger-ui/index.html"

echo "To watch frontend logs: tail -f $FRONTEND_LOG_FILE"
