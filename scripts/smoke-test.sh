#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
AUTH_BASE="$BASE_URL/api/auth"
USER_BASE="$BASE_URL/api/kullanicilar"

EMAIL="smoke.$(date +%s)@example.com"
FIRST_NAME="Smoke"
LAST_NAME="Tester"
DEPARTMENT="QA"
PASSWORD_OLD="Pass123!"
PASSWORD_NEW="Pass456!"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log_step() {
  echo
  echo "==> $1"
}

fail() {
  echo "[FAIL] $1"
  exit 1
}

extract_json_field() {
  local file="$1"
  local field="$2"
  sed -n "s/.*\"${field}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$file" | head -n 1
}

http_json() {
  local method="$1"
  local url="$2"
  local body="$3"
  local out_file="$4"
  local auth_header="${5:-}"

  if [[ -n "$auth_header" ]]; then
    curl -sS -o "$out_file" -w "%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $auth_header" \
      -d "$body"
  else
    curl -sS -o "$out_file" -w "%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body"
  fi
}

http_get_auth() {
  local url="$1"
  local out_file="$2"
  local token="$3"

  curl -sS -o "$out_file" -w "%{http_code}" \
    -X GET "$url" \
    -H "Authorization: Bearer $token"
}

log_step "0) Health check"
HEALTH_CODE=$(curl -sS -o "$TMP_DIR/health.json" -w "%{http_code}" "$USER_BASE/health" || true)
[[ "$HEALTH_CODE" == "200" ]] || fail "Backend is not reachable at $BASE_URL (HTTP $HEALTH_CODE)"
echo "[OK] Backend health is 200"

log_step "1) Register user"
REGISTER_BODY=$(cat <<JSON
{"firstName":"$FIRST_NAME","lastName":"$LAST_NAME","email":"$EMAIL","password":"$PASSWORD_OLD","department":"$DEPARTMENT"}
JSON
)
REGISTER_CODE=$(http_json "POST" "$AUTH_BASE/register" "$REGISTER_BODY" "$TMP_DIR/register.json")
[[ "$REGISTER_CODE" == "201" ]] || {
  cat "$TMP_DIR/register.json"
  fail "Register failed (HTTP $REGISTER_CODE)"
}
TOKEN=$(extract_json_field "$TMP_DIR/register.json" "token")
[[ -n "$TOKEN" ]] || fail "Register succeeded but token not found"
echo "[OK] Registered: $EMAIL"

log_step "2) Login with original password"
LOGIN_BODY=$(cat <<JSON
{"email":"$EMAIL","password":"$PASSWORD_OLD"}
JSON
)
LOGIN_CODE=$(http_json "POST" "$AUTH_BASE/login" "$LOGIN_BODY" "$TMP_DIR/login-old.json")
[[ "$LOGIN_CODE" == "200" ]] || {
  cat "$TMP_DIR/login-old.json"
  fail "Login with original password failed (HTTP $LOGIN_CODE)"
}
TOKEN=$(extract_json_field "$TMP_DIR/login-old.json" "token")
[[ -n "$TOKEN" ]] || fail "Login succeeded but token not found"
echo "[OK] Login successful (old password)"

log_step "3) Fetch user list"
LIST_CODE=$(http_get_auth "$USER_BASE" "$TMP_DIR/list.json" "$TOKEN")
[[ "$LIST_CODE" == "200" ]] || {
  cat "$TMP_DIR/list.json"
  fail "Fetching user list failed (HTTP $LIST_CODE)"
}
if ! grep -q "$EMAIL" "$TMP_DIR/list.json"; then
  echo "[WARN] User list fetched but new user email not found in current page/list"
else
  echo "[OK] User list fetched and contains: $EMAIL"
fi

log_step "4) Change password"
CHANGE_BODY=$(cat <<JSON
{"currentPassword":"$PASSWORD_OLD","newPassword":"$PASSWORD_NEW"}
JSON
)
CHANGE_CODE=$(http_json "POST" "$USER_BASE/change-password" "$CHANGE_BODY" "$TMP_DIR/change-password.json" "$TOKEN")
[[ "$CHANGE_CODE" == "200" ]] || {
  cat "$TMP_DIR/change-password.json"
  fail "Password change failed (HTTP $CHANGE_CODE)"
}
echo "[OK] Password changed"

log_step "5) Login with new password"
LOGIN_NEW_BODY=$(cat <<JSON
{"email":"$EMAIL","password":"$PASSWORD_NEW"}
JSON
)
LOGIN_NEW_CODE=$(http_json "POST" "$AUTH_BASE/login" "$LOGIN_NEW_BODY" "$TMP_DIR/login-new.json")
[[ "$LOGIN_NEW_CODE" == "200" ]] || {
  cat "$TMP_DIR/login-new.json"
  fail "Login with new password failed (HTTP $LOGIN_NEW_CODE)"
}
NEW_TOKEN=$(extract_json_field "$TMP_DIR/login-new.json" "token")
[[ -n "$NEW_TOKEN" ]] || fail "New-password login succeeded but token not found"
echo "[OK] Login successful (new password)"

echo
echo "Smoke test completed successfully."
echo "Test user: $EMAIL"
