# Crimson Engine - Dev Server Launcher
# Double-click or run: .\start_dev.ps1

Write-Host ""
Write-Host "  *** Crimson Engine - Dev Server ***" -ForegroundColor Red
Write-Host ""

# Change to script directory (so it works when double-clicked)
Set-Location $PSScriptRoot

# Start dev server and open browser
Start-Process "http://localhost:5173"
npm run dev
