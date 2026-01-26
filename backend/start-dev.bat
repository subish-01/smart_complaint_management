@echo off
echo Starting SCMS Backend Server (Development Mode)...
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" run dev
pause