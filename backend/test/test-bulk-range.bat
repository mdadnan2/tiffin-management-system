@echo off
echo ========================================
echo Testing Bulk Date Range Feature
echo ========================================
echo.

echo Step 1: Login to get access token...
curl -X POST http://localhost:3001/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@tiffin.com\",\"password\":\"demo123\"}"
echo.
echo.
echo Copy the accessToken from above and paste it when prompted
echo.
set /p TOKEN="Enter your access token: "
echo.

echo Step 2: Create meals using DATE RANGE (Jan 15-19)...
curl -X POST http://localhost:3003/meals/bulk ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"startDate\":\"2024-01-15\",\"endDate\":\"2024-01-19\",\"mealType\":\"LUNCH\",\"count\":1,\"note\":\"Week lunch using date range\"}"
echo.
echo.

echo Step 3: Create meals using ARRAY format (still works!)...
curl -X POST http://localhost:3003/meals/bulk ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"dates\":[\"2024-01-22\",\"2024-01-23\",\"2024-01-24\"],\"mealType\":\"DINNER\",\"count\":2,\"note\":\"Specific dates dinner\"}"
echo.
echo.

echo Step 4: List meals in date range...
curl -X GET "http://localhost:3003/meals?startDate=2024-01-15&endDate=2024-01-31" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo Step 5: Get dashboard totals...
curl -X GET http://localhost:3003/dashboard ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo ========================================
echo Testing Complete!
echo ========================================
pause
