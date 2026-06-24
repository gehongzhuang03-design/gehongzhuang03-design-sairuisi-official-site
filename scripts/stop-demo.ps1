$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root '.demo-server.pid'

if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Host 'No demo server started by the launcher was found.' -ForegroundColor Yellow
  exit 0
}

$serverPid = [int](Get-Content -LiteralPath $pidFile -Raw)
$process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue

if ($process -and $process.ProcessName -eq 'node') {
  Stop-Process -Id $serverPid -Force
  Write-Host 'The demo server has been stopped.' -ForegroundColor Green
} else {
  Write-Host 'The demo server is already stopped.' -ForegroundColor Yellow
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
