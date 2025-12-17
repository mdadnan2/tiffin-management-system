@echo off
echo Tiffin Management System - API Test
echo ==================================

echo.
echo Testing API endpoints...
echo.

echo 1. Testing Auth Service Health...
curl -s http://localhost:3001/auth/health
echo.

echo 2. Testing Login...
curl -s -X POST http://localhost:3001/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@tiffin.com\",\"password\":\"demo123\"}"
echo.

echo 3. Testing User Service Health...
curl -s http://localhost:3002/users/health
echo.

echo 4. Testing Meal Service Health...
curl -s http://localhost:3003/meals/health
echo.

echo 5. Testing Admin Service Health...
curl -s http://localhost:3004/admin/health
echo.

echo 6. Testing Consul Services...
curl -s http://localhost:8500/v1/catalog/services
echo.

echo.
echo API test completed.
echo.
echo For detailed testing, use the .http files in backend/test/ directory
echo with REST Client extension in VS Code.
echo.
pause