@echo off
echo Tiffin Management System - Database Fix
echo =====================================

echo.
echo This script fixes database schema synchronization issues.
echo.

echo Step 1: Starting database...
docker-compose up -d db
if %errorlevel% neq 0 (
    echo Error: Failed to start database. Make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo Waiting 10 seconds for database to initialize...
timeout /t 10 /nobreak > nul

echo.
echo Step 2: Applying database migrations...
cd backend
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo Warning: Migration failed. Trying to reset...
    call npx prisma migrate reset --force
    if %errorlevel% neq 0 (
        echo Error: Database reset failed
        pause
        exit /b 1
    )
)

echo.
echo Step 3: Regenerating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error: Prisma client generation failed
    pause
    exit /b 1
)

echo.
echo Step 4: Rebuilding all services...
call npm run build:all
if %errorlevel% neq 0 (
    echo Error: Service build failed
    pause
    exit /b 1
)

cd ..

echo.
echo =====================================
echo Database fix completed successfully!
echo =====================================
echo.
echo You can now start the services with:
echo start-all.bat
echo.
pause