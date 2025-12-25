# Error Handling Implementation

## Global Exception Filter

All services now use a centralized exception filter that provides:
- Consistent error response format
- Automatic logging of errors
- Stack trace capture for debugging
- Timestamp and request path tracking

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## Improved Error Messages

### Auth Service
- ✅ `User with email 'user@example.com' already exists`
- ✅ `Invalid email or password`
- ✅ `Invalid refresh token: User not found`
- ✅ `Invalid or expired refresh token`
- ✅ `User account not found or has been deleted`

### User Service
- ✅ `User with ID 'uuid' not found`
- ✅ Validation before update operations

### Meal Service
- ✅ `Invalid bulk meal request: Provide either "dates" array or "startDate" and "endDate"`
- ✅ `Invalid date range: startDate (2024-01-20) must be before or equal to endDate (2024-01-15)`
- ✅ `Date range too large: 120 days. Maximum allowed is 90 days`
- ✅ `Invalid daysOfWeek values: [7, 8]. Must be between 0 (Sunday) and 6 (Saturday)`
- ✅ `Meal with ID 'uuid' not found`
- ✅ `You do not have permission to update this meal`
- ✅ `You do not have permission to cancel this meal`
- ✅ `No active meals found between 2024-01-15 and 2024-01-20 for meal type LUNCH`
- ✅ `No active meals found to cancel between 2024-01-15 and 2024-01-20`

### Price Service
- ✅ `Breakfast price cannot be negative`
- ✅ `Lunch price cannot be negative`
- ✅ `Dinner price cannot be negative`
- ✅ `Custom price cannot be negative`

### Admin Service
- ✅ `User with ID 'uuid' not found`

## Implementation Details

### 1. Global Filter (`libs/common/src/filters/http-exception.filter.ts`)
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Catches all exceptions
  // Logs errors with context
  // Returns consistent format
}
```

### 2. Applied to All Services
- Auth Service (port 3001)
- User Service (port 3002)
- Meal Service (port 3003)
- Admin Service (port 3004)

### 3. Error Types Handled
- `BadRequestException` (400) - Invalid input
- `UnauthorizedException` (401) - Auth failures
- `NotFoundException` (404) - Resource not found
- `ConflictException` (409) - Duplicate resources
- `InternalServerErrorException` (500) - Server errors

## Testing Error Handling

### Test Invalid Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrong"}'
```

Response:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/auth/login"
}
```

### Test Invalid Date Range
```bash
curl -X POST http://localhost:3003/meals/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2024-12-31","endDate":"2024-01-01","mealType":"LUNCH"}'
```

Response:
```json
{
  "statusCode": 400,
  "message": "Invalid date range: startDate (2024-12-31) must be before or equal to endDate (2024-01-01)",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/meals/bulk"
}
```

### Test Negative Price
```bash
curl -X PATCH http://localhost:3002/users/me/price \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"breakfast":-50}'
```

Response:
```json
{
  "statusCode": 400,
  "message": "Breakfast price cannot be negative",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/users/me/price"
}
```

## Benefits

1. **User-Friendly**: Clear, actionable error messages
2. **Debugging**: Automatic logging with stack traces
3. **Consistency**: Same format across all services
4. **Security**: No sensitive data leaked in errors
5. **Maintainability**: Centralized error handling logic

## Logs

All errors are automatically logged with:
- HTTP method and URL
- Status code
- Error message
- Stack trace (for debugging)

Example log:
```
[AllExceptionsFilter] POST /auth/login - Status: 401 - Message: Invalid email or password
```
