$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Start-AppWindow {
    param(
        [string]$Title,
        [string]$Directory,
        [string]$Command
    )

    $PowerShellCommand = "Set-Location '$Directory'; `$Host.UI.RawUI.WindowTitle = '$Title'; $Command"
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $PowerShellCommand
    )
}

if (-not (Test-Path (Join-Path $Root "backend\node_modules"))) {
    throw "backend\node_modules is missing. Run .\setup-windows.ps1 first."
}

if (-not (Test-Path (Join-Path $Root "client\node_modules"))) {
    throw "client\node_modules is missing. Run .\setup-windows.ps1 first."
}

if (-not (Test-Path (Join-Path $Root "ai\.venv\Scripts\python.exe"))) {
    throw "ai\.venv is missing. Run .\setup-windows.ps1 first."
}

Write-Host "Starting FarmSocial services..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "AI:       http://localhost:5001"
Write-Host ""
Write-Host "MongoDB must already be running on mongodb://127.0.0.1:27017/farmsocial"

Start-AppWindow -Title "FarmSocial Backend" -Directory (Join-Path $Root "backend") -Command "npm.cmd start"
Start-Sleep -Seconds 2
Start-AppWindow -Title "FarmSocial AI" -Directory (Join-Path $Root "ai") -Command ".\.venv\Scripts\python.exe app.py"
Start-Sleep -Seconds 2
Start-AppWindow -Title "FarmSocial Frontend" -Directory (Join-Path $Root "client") -Command "npm.cmd start"
