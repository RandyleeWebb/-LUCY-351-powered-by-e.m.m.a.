@echo off
setlocal
:: Ensure we are running from the directory of this script
cd /d "%~dp0"

echo ===================================================
echo    LUCY SOVEREIGN 351 - NATIVE OS KERNEL STARTUP
echo ===================================================
echo.

:: Kill any stale Vite or Electron processes
echo [CLEANUP] Terminating stale processes...
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul
timeout /t 1 /nobreak >nul

:: Check for node_modules
if not exist node_modules (
    echo [!] node_modules not found. Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Check your Node.js installation.
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies found.
)

echo.
echo [LAUNCH] Starting Lucy Sovereign Native Kernel...
echo [INFO] This will start:
echo        - Electron Main Process (Sovereign Kernel)
echo        - Vite Renderer Dev Server (Dashboard UI)
echo        - IPC Bridge (Secure Command Channel)
echo.

:: Launch the native Electron app
call npm run lucy:sovereign

:: If the above command exits, show status
echo.
if errorlevel 1 (
    echo [ERROR] Lucy failed to start. Check the logs above.
) else (
    echo [OK] Lucy shut down cleanly.
)
echo.
pause
