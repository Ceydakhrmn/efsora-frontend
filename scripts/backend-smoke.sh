#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if [[ ! -d "$BACKEND_DIR" ]]; then
  echo "[FAIL] backend directory not found at: $BACKEND_DIR"
  exit 1
fi

if [[ ! -f "$BACKEND_DIR/pom.xml" ]]; then
  echo "[FAIL] backend/pom.xml not found. Ensure backend submodule is initialized."
  echo "Hint: git submodule update --init --recursive"
  exit 1
fi

cd "$BACKEND_DIR"
chmod +x ./mvnw

echo "[INFO] Running targeted backend smoke test: InvitationServiceTest"
./mvnw -Dtest=InvitationServiceTest test

echo "[OK] Backend smoke test passed."
