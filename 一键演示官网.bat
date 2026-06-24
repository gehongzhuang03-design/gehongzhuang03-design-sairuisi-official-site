@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\demo.ps1"
if errorlevel 1 (
  echo.
  echo 演示启动失败，请查看上方提示。
  pause
)
