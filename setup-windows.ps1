param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Command {
    param(
        [string]$CommandName,
        [string]$InstallHint
    )

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "$CommandName was not found. $InstallHint"
    }
}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Step "Checking required Windows tools"
Assert-Command "node" "Install Node.js LTS from https://nodejs.org/"
Assert-Command "npm" "Install Node.js LTS from https://nodejs.org/"
Assert-Command "python" "Install Python 3 from https://www.python.org/downloads/windows/ and enable Add python.exe to PATH."

Write-Host "Node:   $(node --version)"
Write-Host "npm:    $(npm.cmd --version)"
Write-Host "Python: $(python --version)"

if ($Clean) {
    Write-Step "Removing Linux/old dependency folders"
    $PathsToRemove = @(
        "backend\node_modules",
        "client\node_modules",
        "client\build",
        "ai\venv",
        "ai\.venv"
    )

    foreach ($RelativePath in $PathsToRemove) {
        $FullPath = Join-Path $Root $RelativePath
        if (Test-Path $FullPath) {
            Write-Host "Removing $RelativePath"
            Remove-Item -LiteralPath $FullPath -Recurse -Force
        }
    }
}

Write-Step "Installing backend dependencies"
Push-Location (Join-Path $Root "backend")
npm.cmd install --legacy-peer-deps
Pop-Location

Write-Step "Installing frontend dependencies"
Push-Location (Join-Path $Root "client")
npm.cmd install --legacy-peer-deps
Pop-Location

Write-Step "Creating Windows Python virtual environment for AI service"
Push-Location (Join-Path $Root "ai")
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\pip.exe" install -r requirements.txt
Pop-Location

Write-Step "Setup complete"
Write-Host "Next:"
Write-Host "1. Install/start MongoDB Community Server for Windows."
Write-Host "2. Run: .\start-windows.ps1"
