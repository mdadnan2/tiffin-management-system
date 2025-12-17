@echo off
echo Tiffin Management System - Initial Setup
echo =======================================

echo.
echo Step 1: Installing dependencies...
echo.
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Backend npm install failed
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Frontend npm install failed
    pause
    exit /b 1
)

cd ..

echo.
echo Step 2: Starting database...
docker-compose up -d db
if %errorlevel% neq 0 (
    echo Error: Failed to start database
    pause
    exit /b 1
)

echo.
echo Waiting 10 seconds for database to initialize...
timeout /t 10 /nobreak > nul

echo.
echo Step 3: Running database migrations and seeding...
cd backend
call npm run setup
if %errorlevel% neq 0 (
    echo Error: Database setup failed
    pause
    exit /b 1
)

cd ..

echo.
echo Step 4: Building all services...
cd backend
call npm run build:all
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

cd ..

echo.
echo =======================================
echo Setup completed successfully!
echo =======================================
echo.
echo Next steps:
echo 1. Run 'start-all.bat' to start all services
echo 2. Or use Docker: 'npm run docker:up'
echo.
echo Demo credentials:
echo - User: demo@tiffin.com / demo123
echo - Admin: admin@tiffin.com / demo123
echo.
echo Services will be available at:
echo - Frontend: http://localhost:3000
echo - Consul UI: http://localhost:8500/ui
echo - Auth Service: http://localhost:3001
echo - User Service: http://localhost:3002
echo - Meal Service: http://localhost:3003
echo - Admin Service: http://localhost:3004
echo.
pause