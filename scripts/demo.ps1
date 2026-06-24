$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
$bundledNode = Join-Path $runtimeRoot 'node\bin\node.exe'
$bundledPnpm = Join-Path $runtimeRoot 'bin\pnpm.cmd'
$url = 'http://localhost:3001'
$pidFile = Join-Path $root '.demo-server.pid'
$logDir = Join-Path $root '.demo-logs'

function Find-Executable([string]$name, [string]$fallback) {
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  if (Test-Path -LiteralPath $fallback) { return $fallback }
  return $null
}

function Test-OfficialSite {
  try {
    $health = Invoke-RestMethod -Uri "$url/api/health" -TimeoutSec 2
    return $health.ok -eq $true -and $health.service -eq 'sairuisi-api'
  } catch { return $false }
}

Write-Host ''
Write-Host '========================================' -ForegroundColor DarkGray
Write-Host '  Sairuisi Official Site - Demo Launcher' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor DarkGray
Write-Host ''

if (Test-OfficialSite) {
  Write-Host '[DONE] The website is already running.' -ForegroundColor Green
  Start-Process $url
  exit 0
}

$node = Find-Executable 'node' $bundledNode
$pnpm = Find-Executable 'pnpm' $bundledPnpm

if (-not $node -or -not $pnpm) {
  Write-Host '[ERROR] Node.js or pnpm was not found.' -ForegroundColor Red
  Write-Host 'Install Node.js 20+, then run: corepack enable' -ForegroundColor Yellow
  exit 1
}

$nodeDir = Split-Path -Parent $node
$pnpmDir = Split-Path -Parent $pnpm
$env:PATH = "$nodeDir;$pnpmDir;$env:PATH"
Set-Location -LiteralPath $root

if (-not (Test-Path -LiteralPath (Join-Path $root 'node_modules'))) {
  Write-Host '[1/3] Installing dependencies for the first run...' -ForegroundColor Cyan
  & $pnpm install --config.enableGlobalVirtualStore=false
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
} else {
  Write-Host '[1/3] Dependencies are ready.' -ForegroundColor DarkGray
}

Write-Host '[2/3] Building the demo website...' -ForegroundColor Cyan
& $pnpm build
if ($LASTEXITCODE -ne 0) { throw 'Website build failed.' }

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stdout = Join-Path $logDir 'server.log'
$stderr = Join-Path $logDir 'server-error.log'

Write-Host '[3/3] Starting the website server...' -ForegroundColor Cyan
$process = Start-Process -FilePath $node `
  -ArgumentList 'backend/server.js' `
  -WorkingDirectory $root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr `
  -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ASCII

$ready = $false
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Milliseconds 350
  if (Test-OfficialSite) { $ready = $true; break }
  if ($process.HasExited) { break }
}

if (-not $ready) {
  Write-Host '[ERROR] The server did not start correctly.' -ForegroundColor Red
  if (Test-Path -LiteralPath $stderr) { Get-Content -LiteralPath $stderr }
  exit 1
}

Write-Host ''
Write-Host '[DONE] Website: ' -NoNewline -ForegroundColor Green
Write-Host $url -ForegroundColor White
Write-Host 'Double-click the stop script when the demo is finished.' -ForegroundColor DarkGray
Start-Process $url
