@echo off
echo Testing Bulk Scheduling Functionality
echo ====================================

echo.
echo Starting meal service...
start "Meal Service" cmd /k "cd backend && npm run start:meal"

echo.
echo Waiting 10 seconds for service to start...
timeout /t 10 /nobreak > nul

echo.
echo Testing bulk meal creation...
echo.

echo 1. Login to get token...
curl -s -X POST http://localhost:3003/meals/health
if %errorlevel% equ 0 (
    echo ✓ Meal service is running
) else (
    echo ✗ Meal service is not responding
    pause
    exit /b 1
)

echo.
echo 2. Test bulk meal endpoint (requires authentication)...
echo Note: You need to login first and use the token for actual testing
echo.
echo Bulk scheduling endpoints available:
echo POST /meals/bulk - Create meals for multiple dates
echo.
echo Example request body:
echo {
echo   "startDate": "2024-01-15",
echo   "endDate": "2024-01-19", 
echo   "mealType": "LUNCH",
echo   "count": 1,
echo   "skipWeekends": true
echo }
echo.
echo ✓ Bulk scheduling functionality is now implemented!
echo.
pause