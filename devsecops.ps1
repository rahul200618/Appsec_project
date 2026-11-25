# Khata DevSecOps Terminal Interface (Version 1 & Version 2)
$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot

# Ensure TruffleHog is available in this session
$thDir = "$env:LOCALAPPDATA\Programs\trufflehog"
if ((Test-Path $thDir) -and ($env:Path -notlike "*$thDir*")) {
    $env:Path += ";$thDir"
}

function Stop-AppServers {
    Write-Host "`nStopping any servers on ports 5000 and 5173..." -ForegroundColor Yellow
    foreach ($port in @(5000, 5173)) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            if ($c.OwningProcess -and $c.OwningProcess -ne 0) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
    Start-Sleep -Seconds 1
    Write-Host "Ports 5000 and 5173 cleared." -ForegroundColor Green
}

function Start-VersionServers($ver) {
    Stop-AppServers
    $backendPath = Join-Path $Root "$ver\backend"
    $frontendPath = Join-Path $Root "$ver\frontend"

    if ($ver -eq "version1") {
        $feCmd = "npm run dev"
        $beCmd = "npm start"
    } else {
        $feCmd = "npm run preview"
        $beCmd = "npm start"
    }

    Write-Host "Starting $ver Backend (http://localhost:5000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; Write-Host '=== $ver BACKEND ===' -ForegroundColor Cyan; $beCmd"

    Write-Host "Starting $ver Frontend (http://localhost:5173)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host '=== $ver FRONTEND ===' -ForegroundColor Cyan; $feCmd"

    Write-Host "`nBoth $ver servers launched in separate windows!" -ForegroundColor Green
}

function Run-Semgrep($ver) {
    $reportDir = if ($ver -eq "version1") { "reports\before" } else { "reports\after" }
    Write-Host "`nRunning Semgrep on $ver..." -ForegroundColor Cyan
    Push-Location $Root
    semgrep scan --config auto --config semgrep-rules/ --exclude node_modules --exclude dist --exclude build --exclude reports $ver
    semgrep scan --config auto --config semgrep-rules/ --exclude node_modules --exclude dist --exclude build --exclude reports --json --output "$reportDir\semgrep.json" $ver | Out-Null
    semgrep scan --config auto --config semgrep-rules/ --exclude node_modules --exclude dist --exclude build --exclude reports --text --output "$reportDir\semgrep.txt" $ver | Out-Null
    Pop-Location
    Write-Host "Saved reports to $reportDir\semgrep.json and $reportDir\semgrep.txt" -ForegroundColor Green
}

function Run-TruffleHog($ver) {
    $reportDir = if ($ver -eq "version1") { "reports\before" } else { "reports\after" }
    Write-Host "`nRunning TruffleHog on $ver..." -ForegroundColor Cyan
    Push-Location $Root
    if ($ver -eq "version1") {
        trufflehog filesystem version1\backend\config version1\backend\middleware version1\backend\models version1\backend\routes version1\backend\server.js version1\backend\.env version1\frontend\src --no-verification
        trufflehog filesystem version1\backend\config version1\backend\middleware version1\backend\models version1\backend\routes version1\backend\server.js version1\backend\.env version1\frontend\src --no-verification --json > "$reportDir\trufflehog.json"
        trufflehog filesystem version1\backend\config version1\backend\middleware version1\backend\models version1\backend\routes version1\backend\server.js version1\backend\.env version1\frontend\src --no-verification > "$reportDir\trufflehog.txt" 2>&1
    } else {
        trufflehog filesystem version2 --exclude-paths=.trufflehog-ignore --no-verification
        trufflehog filesystem version2 --exclude-paths=.trufflehog-ignore --no-verification --json > "$reportDir\trufflehog.json"
        trufflehog filesystem version2 --exclude-paths=.trufflehog-ignore --no-verification > "$reportDir\trufflehog.txt" 2>&1
    }
    Pop-Location
    Write-Host "Saved reports to $reportDir\trufflehog.json and $reportDir\trufflehog.txt" -ForegroundColor Green
}

function Show-Menu {
    Clear-Host
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "     KHATA DEVSECOPS CLI  (Version 1 & Version 2)    " -ForegroundColor White
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "  [1] Start Version 1 (Vulnerable Baseline - :5000 & :5173)"
    Write-Host "  [2] Start Version 2 (Fixed Secure App    - :5000 & :5173)"
    Write-Host "  [3] Stop All Running Servers (:5000 & :5173)"
    Write-Host "-----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [4] Run Semgrep    - Version 1 (saves reports/before)"
    Write-Host "  [5] Run Semgrep    - Version 2 (saves reports/after)"
    Write-Host "  [6] Run TruffleHog - Version 1 (saves reports/before)"
    Write-Host "  [7] Run TruffleHog - Version 2 (saves reports/after)"
    Write-Host "-----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [A] Run Semgrep + TruffleHog - Version 1"
    Write-Host "  [B] Run Semgrep + TruffleHog - Version 2"
    Write-Host "  [Q] Quit"
    Write-Host "=====================================================" -ForegroundColor Cyan
}

do {
    Show-Menu
    $choice = Read-Host "Select an option"
    switch ($choice.ToUpper()) {
        "1" { Start-VersionServers "version1" }
        "2" { Start-VersionServers "version2" }
        "3" { Stop-AppServers }
        "4" { Run-Semgrep "version1" }
        "5" { Run-Semgrep "version2" }
        "6" { Run-TruffleHog "version1" }
        "7" { Run-TruffleHog "version2" }
        "A" { Run-Semgrep "version1"; Run-TruffleHog "version1" }
        "B" { Run-Semgrep "version2"; Run-TruffleHog "version2" }
        "Q" { break }
        default { Write-Host "Invalid selection." -ForegroundColor Red }
    }
    if ($choice.ToUpper() -ne "Q") {
        Write-Host ""
        Read-Host "Press Enter to return to menu"
    }
} while ($choice.ToUpper() -ne "Q")
