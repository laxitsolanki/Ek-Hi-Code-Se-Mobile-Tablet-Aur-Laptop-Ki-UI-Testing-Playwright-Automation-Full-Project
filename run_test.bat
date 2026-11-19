@echo off
title One-Click Playwright Signup Tester
echo ===================================================
echo   Checking & Installing Playwright (First Time Only)
echo ===================================================

if not exist "node_modules" (
    call npm install
    call npx playwright install chromium
)

echo ===================================================
echo   Starting Slow-Motion UI & Validation Tests...
echo ===================================================
call npx playwright test test_signup.spec.js --headed --workers=1

echo ===================================================
echo   Testing Complete! Report khul rahi hai...
echo ===================================================
call npx playwright show-report
pause