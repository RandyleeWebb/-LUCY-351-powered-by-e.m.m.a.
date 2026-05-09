@echo off
echo ========================================================
echo LUCY SOVEREIGN 351 (Cognitive Operating Substrate)
echo ========================================================
echo Initializing Kernel and Vision Interface...

call npm install
call npm run electron:dev

pause
