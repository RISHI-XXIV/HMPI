@echo off
echo ========================================
echo    HMPI-Insight Platform Launcher
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo Starting Frontend Application...
start cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    Application Started Successfully!
echo ========================================
echo.
echo Access the application at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Press any key to open the application in browser...
pause > nul
start http://localhost:3000
echo.
echo To stop the servers, close the command windows.
pause
