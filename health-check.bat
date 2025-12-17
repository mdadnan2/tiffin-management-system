@echo off
echo Tiffin Management System - Health Check
echo ======================================

echo.
echo Checking service health...
echo.

echo Consul (Service Registry):
curl -s http://localhost:8500/v1/status/leader > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Consul is running at http://localhost:8500
) else (
    echo ✗ Consul is not responding
)

echo.
echo Auth Service:
curl -s http://localhost:3001/auth/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Auth Service is running at http://localhost:3001
) else (
    echo ✗ Auth Service is not responding
)

echo.
echo User Service:
curl -s http://localhost:3002/users/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ User Service is running at http://localhost:3002
) else (
    echo ✗ User Service is not responding
)

echo.
echo Meal Service:
curl -s http://localhost:3003/meals/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Meal Service is running at http://localhost:3003
) else (
    echo ✗ Meal Service is not responding
)

echo.
echo Admin Service:
curl -s http://localhost:3004/admin/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Admin Service is running at http://localhost:3004
) else (
    echo ✗ Admin Service is not responding
)

echo.
echo Frontend:
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is running at http://localhost:3000
) else (
    echo ✗ Frontend is not responding
)

echo.
echo Database:
docker exec tiffin-db pg_isready -U postgres > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL database is running
) else (
    echo ✗ PostgreSQL database is not responding
)

echo.
echo ======================================
echo Health check completed
echo.
echo For detailed service status, visit:
echo http://localhost:8500/ui
echo.
pause