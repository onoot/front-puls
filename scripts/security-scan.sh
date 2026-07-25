#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

echo "========================================="
echo "  Security Scan — $(date +%Y-%m-%d)"
echo "========================================="
echo ""

# --- 1. Secret detection ---
echo -e "${YELLOW}[1/4] Scanning for hardcoded secrets...${NC}"

SECRET_PATTERNS=(
    'password\s*[:=]\s*["\x27][^"\x27]{4,}'
    'secret[_-]?key\s*[:=]\s*["\x27][^"\x27]{4,}'
    'api[_-]?key\s*[:=]\s*["\x27][^"\x27]{4,}'
    'token\s*[:=]\s*["\x27][A-Za-z0-9_\-\.]{20,}'
    'AWS_ACCESS_KEY_ID'
    'AKIA[0-9A-Z]{16}'
    '-----BEGIN (RSA |EC )?PRIVATE KEY-----'
)

SECRET_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -rniE "$pattern" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --include="*.json" --include="*.yaml" --include="*.yml" \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
        --exclude="package-lock.json" --exclude="yarn.lock" \
        . 2>/dev/null | grep -v "\.env\.example" | grep -v "\.gitignore" || true)

    if [ -n "$MATCHES" ]; then
        echo -e "${RED}  FOUND: $pattern${NC}"
        echo "$MATCHES" | head -5
        echo ""
        SECRET_FOUND=1
    fi
done

if [ $SECRET_FOUND -eq 0 ]; then
    echo -e "${GREEN}  No hardcoded secrets found${NC}"
else
    ERRORS=$((ERRORS + 1))
fi
echo ""

# --- 2. .env files in repo ---
echo -e "${YELLOW}[2/4] Checking .env files are not committed...${NC}"

ENV_FILES=$(git ls-files '*.env' '*.env.*' 2>/dev/null | grep -v '\.env\.example' || true)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}  .env files tracked by git:${NC}"
    echo "$ENV_FILES"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}  No .env files in git${NC}"
fi
echo ""

# --- 3. npm audit (backend) ---
echo -e "${YELLOW}[3/4] npm audit — backend-nest...${NC}"

if [ -d "backend-nest/node_modules" ]; then
    cd backend-nest
    AUDIT_OUT=$(npm audit --omit=dev --json 2>/dev/null || true)
    CRITICAL=$(echo "$AUDIT_OUT" | grep -oP '"critical"\s*:\s*\K[0-9]+' | tail -1 || echo "0")
    HIGH=$(echo "$AUDIT_OUT" | grep -oP '"high"\s*:\s*\K[0-9]+' | tail -1 || echo "0")

    if [ "$CRITICAL" != "0" ] || [ "$HIGH" != "0" ]; then
        echo -e "${RED}  Critical: $CRITICAL, High: $HIGH${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  No critical/high vulnerabilities${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}  Skipped (node_modules not installed)${NC}"
fi
echo ""

# --- 4. npm audit (frontend) ---
echo -e "${YELLOW}[4/4] npm audit — frontend-react...${NC}"

if [ -d "front/frontend-react/node_modules" ]; then
    cd front/frontend-react
    AUDIT_OUT=$(npm audit --omit=dev --json 2>/dev/null || true)
    CRITICAL=$(echo "$AUDIT_OUT" | grep -oP '"critical"\s*:\s*\K[0-9]+' | tail -1 || echo "0")
    HIGH=$(echo "$AUDIT_OUT" | grep -oP '"high"\s*:\s*\K[0-9]+' | tail -1 || echo "0")

    if [ "$CRITICAL" != "0" ] || [ "$HIGH" != "0" ]; then
        echo -e "${RED}  Critical: $CRITICAL, High: $HIGH${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  No critical/high vulnerabilities${NC}"
    fi
    cd ../..
else
    echo -e "${YELLOW}  Skipped (node_modules not installed)${NC}"
fi
echo ""

# --- Summary ---
echo "========================================="
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}  SCAN FAILED — $ERRORS issue(s) found${NC}"
    echo "========================================="
    exit 1
else
    echo -e "${GREEN}  SCAN PASSED — no issues${NC}"
    echo "========================================="
    exit 0
fi
