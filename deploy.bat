@echo off
title TS Couriers — Deploy Build
color 0A

echo.
echo  ========================================
echo   TS COURIERS — PRODUCTION BUILD
echo  ========================================
echo.

:: Go to project folder
cd /d "%~dp0"

echo  [1/3] Building...
echo.
call npm run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  BUILD FAILED. Fix errors above and try again.
    pause
    exit /b 1
)

echo.
echo  [2/3] Creating deploy ZIP...
echo.

:: Remove old zip if exists
if exist "deploy_hostinger.zip" del /f "deploy_hostinger.zip"

:: Compress out/ into zip using PowerShell
powershell -Command "Compress-Archive -Path '.\out\*' -DestinationPath '.\deploy_hostinger.zip' -Force"

if %errorlevel% neq 0 (
    color 0C
    echo  ZIP creation failed.
    pause
    exit /b 1
)

echo.
echo  [3/3] Done!
echo.
echo  ========================================
echo   deploy_hostinger.zip is ready!
echo  ========================================
echo.
echo  NEXT STEPS:
echo   1. Login to hPanel
echo   2. Files ^> File Manager ^> public_html
echo   3. Upload deploy_hostinger.zip
echo   4. Extract it there (overwrite all)
echo.

:: Open the project folder so user can grab the zip
explorer "%~dp0"

pause
