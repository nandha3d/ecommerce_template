#!/bin/bash

echo "🚨 Running Hardcode Guard Check..."

FAILED=0

# Ensure we are in the right directory (check for 'app' folder)
if [ ! -d "app" ]; then
    if [ -d "../app" ]; then
        cd ..
    fi
fi

SCAN_PATHS="app routes database"
# Verify paths exist before scanning to avoid grep errors
for path in $SCAN_PATHS; do
    if [ ! -e "$path" ]; then
        echo "⚠️  Warning: Path '$path' not found. Skipping."
    fi
done

BLOCKED_PATTERNS=(
  "'active'"
  "'inactive'"
  "'enabled'"
  "'disabled'"
  "'pending'"
  "'paid'"
  "'failed'"
  "'cancelled'"
  "'completed'"
  "'INR'"
  "'USD'"
  "/uploads"
  "/storage"
  "/images"
  "'admin'"
  "'seller'"
  "'user'"
  "env("
)

for PATTERN in "${BLOCKED_PATTERNS[@]}"; do
  # Use || true to prevent script exit if grep finds nothing (set -e safety)
  MATCHES=$(grep -R --line-number --exclude-dir=vendor --exclude-dir=node_modules "$PATTERN" $SCAN_PATHS 2>/dev/null)
  if [ ! -z "$MATCHES" ]; then
    echo "❌ HARD-CODE VIOLATION FOUND ($PATTERN):"
    echo "$MATCHES"
    FAILED=1
  fi
done

# Detect magic numbers (except migrations & config)
# Excluding more specific patterns to avoid false positives in common PHP constructs if needed
MAGIC_NUMBERS=$(grep -R --line-number -E '[^a-zA-Z](10|20|50|100)[^a-zA-Z]' app \
  --exclude-dir=Enums \
  --exclude-dir=config \
  2>/dev/null)

if [ ! -z "$MAGIC_NUMBERS" ]; then
  echo "❌ MAGIC NUMBER VIOLATION:"
  echo "$MAGIC_NUMBERS"
  FAILED=1
fi

# STRICT MODE: Enforce “NO DB IN CONTROLLERS”
DB_IN_CONTROLLERS=$(grep -R "DB::\|Model::" app/Http/Controllers 2>/dev/null)

# Note: "Model::" is a broad check, might catch valid uses if not careful. 
# But per instructions, valid Model usage should be via Service/Repository injection, not static calls?
# Usually Models are used, but maybe "DB::" is the main evil. 
# The prompt explicitly asked for this grep.
if [ ! -z "$DB_IN_CONTROLLERS" ]; then
  echo "❌ DATABASE ACCESS IN CONTROLLERS DETECTED:"
  echo "$DB_IN_CONTROLLERS"
  FAILED=1
fi

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "🚫 BUILD FAILED: Hardcoding or Architectural violation detected."
  echo "👉 Use Enums, Config, or Constants instead."
  exit 1
fi

echo "✅ Hardcode Guard Passed"
exit 0
