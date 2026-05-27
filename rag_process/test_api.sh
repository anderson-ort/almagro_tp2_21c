#!/usr/bin/env bash
# =============================================================================
# test_api.sh — RAG API endpoint tests using curl
# Usage: ./test_api.sh [base_url] [api_key]
# =============================================================================

BASE_URL="${1:-http://localhost:3000}"
SAMPLE_DIR="$(dirname "$0")/documents_sample"
ENV_FILE="$(dirname "$0")/.env"

# Load API_KEY from .env if not passed as argument
if [ -n "$2" ]; then
  API_KEY="$2"
elif [ -f "$ENV_FILE" ]; then
  API_KEY=$(grep "^API_KEY=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
else
  echo -e "${RED}ERROR: No API_KEY provided and .env not found${NC}"
  exit 1
fi

if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_secret_upload_key" ]; then
  echo -e "${YELLOW}WARNING: API_KEY is still the default placeholder.${NC}"
  echo -e "         Set a real value in .env: API_KEY=your-real-key"
  echo ""
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

print_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

assert_status() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"

  if [ "$actual" -eq "$expected" ]; then
    echo -e "  ${GREEN}✔ PASS${NC} [$label] → HTTP $actual"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✘ FAIL${NC} [$label] → expected HTTP $expected, got HTTP $actual"
    echo -e "         body: $body"
    FAIL=$((FAIL + 1))
  fi
}

# -----------------------------------------------------------------------------
# 1. Upload — happy path (markdown file)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — valid markdown file"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -H "X-API-Key: ${API_KEY}" \
  -F "file=@${SAMPLE_DIR}/normas_convivencia_y_buenas_practicas.md;type=text/markdown" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload markdown" 201 "$HTTP_CODE" "$BODY"
echo "         response: $BODY"

# -----------------------------------------------------------------------------
# 2. Upload — second file (for documents list to have > 1 result)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — second valid markdown file"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -H "X-API-Key: ${API_KEY}" \
  -F "file=@${SAMPLE_DIR}/regimen_evaluacion_y_calificaciones.md;type=text/markdown" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload second markdown" 201 "$HTTP_CODE" "$BODY"
echo "         response: $BODY"

# -----------------------------------------------------------------------------
# 3. Upload — missing API key (should return 401)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — missing X-API-Key header"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -F "file=@${SAMPLE_DIR}/normas_convivencia_y_buenas_practicas.md" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload no auth" 401 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 4. Upload — wrong API key (should return 401)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — wrong X-API-Key"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -H "X-API-Key: wrong-key" \
  -F "file=@${SAMPLE_DIR}/normas_convivencia_y_buenas_practicas.md" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload wrong key" 401 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 5. Upload — no file in body (should return 400)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — no file in body"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -H "X-API-Key: ${API_KEY}" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload no file" 400 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 6. Upload — unsupported file type (should return 400)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/upload — unsupported file type (.json)"

TMPFILE=$(mktemp /tmp/test_XXXXXX.json)
echo '{"test": true}' > "$TMPFILE"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/upload" \
  -H "X-API-Key: ${API_KEY}" \
  -F "file=@${TMPFILE};type=application/json" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "upload bad mime" 400 "$HTTP_CODE" "$BODY"
rm -f "$TMPFILE"

# -----------------------------------------------------------------------------
# 7. Documents — list all ingested files
# -----------------------------------------------------------------------------

print_header "GET /api/v1/documents — list all documents"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "${BASE_URL}/api/v1/documents" \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "documents list" 200 "$HTTP_CODE" "$BODY"
echo "         response: $BODY"

# -----------------------------------------------------------------------------
# 8. Query — valid prompt
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — valid prompt"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Cuales son las normas de convivencia?", "topK": 3}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query valid" 200 "$HTTP_CODE" "$BODY"
echo "         response: $BODY"

# -----------------------------------------------------------------------------
# 9. Query — valid prompt without topK (uses default)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — valid prompt, no topK (default=3)"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Cuales son los criterios de evaluacion?"}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query no topK" 200 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 10. Query — missing prompt (should return 400)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — missing prompt"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query no prompt" 400 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 11. Query — empty prompt string (should return 400)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — empty prompt string"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "   "}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query empty prompt" 400 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 12. Query — invalid topK (string, should return 400)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — invalid topK (string)"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "topK": "abc"}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query bad topK" 400 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# 13. Query — topK capped at 10 (should still return 200)
# -----------------------------------------------------------------------------

print_header "POST /api/v1/query — topK above cap (50 → capped to 10)"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Cuales son los proyectos propuestos?", "topK": 50}' \
)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "query topK capped" 200 "$HTTP_CODE" "$BODY"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}  (total: $((PASS + FAIL)))"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

[ "$FAIL" -gt 0 ] && exit 1 || exit 0
