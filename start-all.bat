@echo off
echo Starting Tiffin Management System - All Services
echo ===============================================

echo.
echo Starting Consul (Service Registry)...
start "Consul" cmd /k "docker-compose up consul"

echo.
echo Waiting 10 seconds for Consul to start...
timeout /t 10 /nobreak > nul

echo.
echo Starting Auth Service (Port 3001)...
start "Auth Service" cmd /k "cd backend && npm run start:auth"

echo.
echo Starting User Service (Port 3002)...
start "User Service" cmd /k "cd backend && npm run start:user"

echo.
echo Starting Meal Service (Port 3003)...
start "Meal Service" cmd /k "cd backend && npm run start:meal"

echo.
echo Starting Admin Service (Port 3004)...
start "Admin Service" cmd /k "cd backend && npm run start:admin"

echo.
echo All services are starting...
echo.
echo Services will be available at:
echo - Consul UI: http://localhost:8500/ui
echo - Auth Service: http://localhost:3001
echo - User Service: http://localhost:3002
echo - Meal Service: http://localhost:3003
echo - Admin Service: http://localhost:3004
echo.
echo Press any key to exit...
pause > nul