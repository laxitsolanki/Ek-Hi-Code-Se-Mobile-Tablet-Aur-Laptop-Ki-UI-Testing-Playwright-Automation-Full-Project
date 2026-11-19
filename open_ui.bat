@echo off
title Playwright Visual UI Dashboard
echo ======================================================
echo   Opening Playwright Graphical UI Window...
echo ======================================================
call npx playwright test --ui
pause
