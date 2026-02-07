
Write-Host "🚨 Running Hardcode Guard Check (PowerShell)..." -ForegroundColor Cyan

$FAILED = 0
$SCAN_PATHS = @("app", "routes", "database")

# Ensure we are in backend or have access to app
$BASE_DIR = Get-Location
if (Test-Path "$BASE_DIR\backend\app") {
    $SCAN_ROOT = "$BASE_DIR\backend"
}
elseif (Test-Path "$BASE_DIR\app") {
    $SCAN_ROOT = "$BASE_DIR"
}
else {
    Write-Host "❌ Error: Could not find 'app' directory. Run from project root or backend folder."
    exit 1
}

$SCAN_PATHS = @("$SCAN_ROOT\app", "$SCAN_ROOT\routes", "$SCAN_ROOT\database")


$BLOCKED_PATTERNS = @(
    "'active'", "'inactive'", "'enabled'", "'disabled'", "'pending'",
    "'paid'", "'failed'", "'cancelled'", "'completed'",
    "'INR'", "'USD'",
    "/uploads", "/storage", "/images",
    "'admin'", "'seller'", "'user'",
    "env\("
)

foreach ($PATTERN in $BLOCKED_PATTERNS) {
    # Escape for RegEx if needed, but SimpleMatch is easier if patterns are simple strings
    # Select-String works recursively
    $MATCHES_FOUND = Get-ChildItem -Path $SCAN_PATHS -Recurse -File -Include *.php | Select-String -Pattern $PATTERN -SimpleMatch

    if ($MATCHES_FOUND) {
        Write-Host "❌ HARD-CODE VIOLATION FOUND ($PATTERN):" -ForegroundColor Red
        foreach ($match in $MATCHES_FOUND) {
            Write-Host "$($match.Path):$($match.LineNumber): $($match.Line.Trim())"
        }
        $FAILED = 1
    }
}

# Magic Numbers (Regex)
$MAGIC_NUMBERS = Get-ChildItem -Path "$SCAN_ROOT\app" -Recurse -File -Include *.php | 
Where-Object { $_.FullName -notmatch "Enums" -and $_.FullName -notmatch "config" } |
Select-String -Pattern "[^a-zA-Z](10|20|50|100)[^a-zA-Z]"

if ($MAGIC_NUMBERS) {
    Write-Host "❌ MAGIC NUMBER VIOLATION:" -ForegroundColor Red
    foreach ($match in $MAGIC_NUMBERS) {
        Write-Host "$($match.Path):$($match.LineNumber): $($match.Line.Trim())"
    }
    $FAILED = 1
}

# DB in Controllers
$DB_IN_CONTROLLERS = Get-ChildItem -Path "$SCAN_ROOT\app\Http\Controllers" -Recurse -File -Include *.php | 
Select-String -Pattern "DB::|Model::" 

if ($DB_IN_CONTROLLERS) {
    Write-Host "❌ DATABASE ACCESS IN CONTROLLERS DETECTED:" -ForegroundColor Red
    foreach ($match in $DB_IN_CONTROLLERS) {
        Write-Host "$($match.Path):$($match.LineNumber): $($match.Line.Trim())"
    }
    $FAILED = 1
}

if ($FAILED -eq 1) {
    Write-Host "`n🚫 BUILD FAILED: Hardcoding or Architectural violation detected." -ForegroundColor Red
    Write-Host "👉 Use Enums, Config, or Constants instead."
    exit 1
}

Write-Host "✅ Hardcode Guard Passed" -ForegroundColor Green
exit 0
