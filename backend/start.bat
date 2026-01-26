@echo off
echo Starting SCMS Backend Server...
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" start
pause