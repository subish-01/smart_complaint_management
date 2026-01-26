@echo off
echo Installing backend dependencies...
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" install
echo.
echo Dependencies installed successfully!
echo.
pause