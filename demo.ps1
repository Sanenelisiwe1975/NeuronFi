#!/usr/bin/env pwsh
# NeuronFi — Demo Launcher
# Run from project root: .\demo.ps1

$ROOT = $PSScriptRoot

Write-Host ""
Write-Host "  NeuronFi — Demo Launcher" -ForegroundColor Cyan
Write-Host "  Kite AI Hackathon" -ForegroundColor DarkCyan
Write-Host ""

# ── Kill anything on port 3000 ──────────────────────────────────────
$port3000 = netstat -ano | Select-String ":3000 " | Select-String "LISTENING"
if ($port3000) {
    $pid3000 = ($port3000 -split "\s+")[-1]
    Write-Host "  Freeing port 3000 (PID $pid3000)..." -ForegroundColor Yellow
    Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
}

# ── Build kite package if dist is missing ───────────────────────────
if (-not (Test-Path "$ROOT\packages\kite\dist\index.js")) {
    Write-Host "  Building @repo/kite..." -ForegroundColor Yellow
    Push-Location "$ROOT\packages\kite"
    npm run build | Out-Null
    Pop-Location
}

Write-Host "  Starting frontend  →  http://localhost:3000" -ForegroundColor Green
Write-Host "  Starting agent     →  terminal window" -ForegroundColor Green
Write-Host ""

# ── Launch frontend in a new terminal window ────────────────────────
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ROOT\apps\web'; Write-Host '  NeuronFi Frontend' -ForegroundColor Cyan; npx next dev --port 3000"
) -WindowStyle Normal

# ── Launch agent in a new terminal window ───────────────────────────
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ROOT'; Write-Host '  NeuronFi Agent Loop' -ForegroundColor Cyan; npm run agent:dev"
) -WindowStyle Normal

# ── Wait for Next.js to be ready then open browser ──────────────────
Write-Host "  Waiting for server..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Write-Host "  ." -NoNewline -ForegroundColor DarkGray
}

Write-Host ""
if ($ready) {
    Write-Host "  Dashboard ready — opening browser" -ForegroundColor Green
    Start-Process "http://localhost:3000/dashboard"
} else {
    Write-Host "  Server still starting — open http://localhost:3000/dashboard manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Frontend : http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host "  Agent    : running in separate window" -ForegroundColor Cyan
Write-Host "  Explorer : https://testnet.kitescan.ai" -ForegroundColor Cyan
Write-Host ""
