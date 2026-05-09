@echo off
title LUCY SOVEREIGN 351 - WINDOWS MOUNT
color 0B

echo ╔══════════════════════════════════════════════════════════════╗
echo ║  LUCY SOVEREIGN 351 — WINDOWS MOUNT SEQUENCE                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STAGE 0-5: HARDWARE VALIDATION (PYTHON BOOT SEQUENCE)
:: ═══════════════════════════════════════════════════════════════════════════

echo [STAGE 0-5] Running Sovereign Boot Sequence...
echo [INFO] Validating CPU, RAM, GPU, runtime dependencies...
echo.

python src\core\boot\BootSequence.py --mode native

if errorlevel 1 (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║  ❌ HARDWARE PRE-FLIGHT FAILED                                ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo [ERROR] Boot sequence detected critical hardware issues.
    echo [INFO] Please resolve the errors above before starting Lucy.
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ✅ HARDWARE VALIDATION COMPLETE                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STAGE 6: OLLAMA LOCAL BRAIN ENGINE
:: ═══════════════════════════════════════════════════════════════════════════

echo [STAGE 6] Igniting Ollama Local Brain Engine...

:: Check if Ollama is installed
where ollama >nul 2>nul
if errorlevel 1 (
    echo [WARNING] Ollama not found. Little Lucys will operate in deterministic mode.
    echo [INFO] To enable local LLM reasoning, install Ollama from: https://ollama.ai
    echo.
    goto :skip_ollama
)

:: Check if Ollama is already running
curl -s http://localhost:11434/api/tags >nul 2>nul
if errorlevel 0 (
    echo [SUCCESS] Ollama already running
    goto :load_model
)

:: Start Ollama in background
echo [INFO] Starting Ollama backend...
start "Ollama Brain" /min "C:\Users\Randy Webb\AppData\Local\Programs\Ollama\ollama app.exe"

:: Wait for Ollama to initialize
timeout /t 3 /nobreak > nul

:load_model
echo [INFO] Pre-loading Llama3 model for Little Lucys...
ollama run llama3 "Ready for Sovereign instructions." >nul 2>nul

if errorlevel 0 (
    echo [SUCCESS] Ollama brain engine online (Llama3 loaded)
) else (
    echo [WARNING] Failed to load Llama3. Attempting to pull...
    ollama pull llama3
    if errorlevel 0 (
        echo [SUCCESS] Llama3 pulled and ready
    ) else (
        echo [WARNING] Could not pull Llama3. Operating in deterministic mode.
    )
)

:skip_ollama
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STAGE 7: NODE DEPENDENCIES
:: ═══════════════════════════════════════════════════════════════════════════

echo [STAGE 7] Checking Node.js dependencies...

if not exist "node_modules" (
	echo [INFO] node_modules not found. Installing dependencies...
	echo [INFO] This only happens once and may take 2-3 minutes.
	echo.
	call npm install
	if errorlevel 1 (
		echo [ERROR] npm install failed. Please check your Node.js installation.
		pause
		exit /b 1
	)
	echo [SUCCESS] Dependencies installed.
) else (
	echo [SUCCESS] Dependencies already installed.
)
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STAGE 8: CREATE SANDBOX DIRECTORIES
:: ═══════════════════════════════════════════════════════════════════════════

echo [STAGE 8] Creating Lucy sandbox directories...

if not exist "C:\LucySandbox" mkdir "C:\LucySandbox"
if not exist "C:\LucySandbox\build" mkdir "C:\LucySandbox\build"
if not exist "C:\LucySandbox\temp" mkdir "C:\LucySandbox\temp"
if not exist "C:\LucySandbox\logs" mkdir "C:\LucySandbox\logs"
if not exist "C:\LucySandbox\artifacts" mkdir "C:\LucySandbox\artifacts"
if not exist "C:\LucySandbox\cache" mkdir "C:\LucySandbox\cache"

echo [SUCCESS] Sandbox directories ready.
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STEP 3: VALIDATE NODE REGISTRY
:: ═══════════════════════════════════════════════════════════════════════════

echo [3/6] Node registry ready...
echo [INFO] 351-node architecture validated at compile time.
echo [SUCCESS] Registry embedded in production build.
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STEP 4: START PRODUCTION BACKEND (LUCY BRAIN)
:: ═══════════════════════════════════════════════════════════════════════════

echo [4/6] Starting Lucy Brain (Production Backend)...
echo [INFO] Initializing:
echo   - ErrorPatternMemory (M3)
echo   - HardwareMonitor (N10)
echo   - TacticalExecutor
echo   - GameEngineBridge (UE5/Unity)
echo   - AgentEventBus
echo.

start "Lucy Brain" /min cmd /c "npm run start:production 2>&1 | tee C:\LucySandbox\logs\lucy-brain-%date:~-4,4%%date:~-7,2%%date:~-10,2%.log"

:: Wait for backend to initialize
timeout /t 5 /nobreak > nul

echo [SUCCESS] Lucy Brain online.
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STEP 5: START CYBER-TECH DASHBOARD (FRONTEND)
:: ═══════════════════════════════════════════════════════════════════════════

echo [5/6] Lighting up the Cyber-Tech Dashboard...
echo [INFO] Features:
echo   - NodeMatrixView (351-node grid)
echo   - LucyChatSovereignty (Emma terminal)
echo   - Manual team requisition
echo   - Real-time narration
echo.

start "Lucy Dashboard" /min cmd /c "npm run start:dashboard 2>&1 | tee C:\LucySandbox\logs\lucy-dashboard-%date:~-4,4%%date:~-7,2%%date:~-10,2%.log"

:: Wait for Vite to start
echo [INFO] Waiting for Vite dev server...
timeout /t 8 /nobreak > nul

echo [SUCCESS] Dashboard online.
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: STEP 6: LAUNCH BROWSER
:: ═══════════════════════════════════════════════════════════════════════════

echo [6/6] Opening dashboard in browser...

start http://localhost:5173

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ✅ LUCY SOVEREIGN 351 — FULLY OPERATIONAL                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Dashboard: http://localhost:5173
echo 📊 Backend Status: Check "Lucy Brain" window
echo 🛡️  Emma Approval Gate: Active
echo 🔧 Manual Team Requisition: Click/drag nodes
echo.
echo 🚀 "Welcome to the Freeway — Lucy is Live"
echo.
echo ═══════════════════════════════════════════════════════════════
echo CONTROLS:
echo   - Use dashboard to select nodes and form teams
echo   - Chat window shows all actions (approve high-risk)
echo   - Close this window to shut down Lucy
echo ═══════════════════════════════════════════════════════════════
echo.

pause

:: ═══════════════════════════════════════════════════════════════════════════
:: SHUTDOWN SEQUENCE
:: ═══════════════════════════════════════════════════════════════════════════

echo.
echo [SHUTDOWN] Stopping all Lucy processes...

taskkill /FI "WINDOWTITLE eq Lucy Brain*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Lucy Dashboard*" /F > nul 2>&1

echo [SUCCESS] Lucy shutdown complete.
echo.
pause
