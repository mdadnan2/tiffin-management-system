# Testing Guide

## Test Structure

```
backend/
├── apps/
│   ├── auth-service/test/
│   │   └── auth.e2e-spec.ts       # Auth API tests
│   ├── user-service/test/
│   │   └── user.e2e-spec.ts       # User API tests
│   ├── meal-service/test/
│   │   └── meal.e2e-spec.ts       # Meal API tests
│   └── admin-service/test/
│       └── admin.e2e-spec.ts      # Admin API tests
└── jest.config.js                  # Jest configuration
```

## Prerequisites

1. **Start services** (all services must be running):
```bash
# Start database and Consul
docker-compose up -d db consul

# Start all services
npm run start:auth
npm run start:user
npm run start:meal
npm run start:admin
```

2. **Seed database** (if not already done):
```bash
npm run setup
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Service Tests
```bash
npm run test:auth    # Auth Service tests
npm run test:user    # User Service tests
npm run test:meal    # Meal Service tests
npm run test:admin   # Admin Service tests
```

### Run with Coverage
```bash
npm run test:cov
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

## Test Coverage

### Auth Service (auth.e2e-spec.ts)
- ✅ User registration
- ✅ Login with valid/invalid credentials
- ✅ Get current user (with/without token)
- ✅ Refresh token
- ✅ Health check

### User Service (user.e2e-spec.ts)
- ✅ Get user profile
- ✅ Update user profile
- ✅ Get price settings
- ✅ Update price settings
- ✅ Health check

### Meal Service (meal.e2e-spec.ts)
- ✅ Create meal
- ✅ List meals (with filters)
- ✅ Update meal
- ✅ Create bulk meals
- ✅ Get dashboard
- ✅ Cancel meal
- ✅ Health check

### Admin Service (admin.e2e-spec.ts)
- ✅ Get all users (admin only)
- ✅ Get user summary
- ✅ Unauthorized access test
- ✅ Health check

## Test Credentials

**Regular User:**
- Email: demo@tiffin.com
- Password: demo123

**Admin User:**
- Email: admin@tiffin.com
- Password: demo123

## Troubleshooting

### Tests Failing?

1. **Ensure all services are running:**
```bash
# Check services
npm run check
```

2. **Database not seeded:**
```bash
npm run seed
```

3. **Port conflicts:**
```bash
# Check if ports are in use
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003
netstat -ano | findstr :3004
```

4. **Clear test data:**
```bash
npm run migrate
npm run seed
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run Tests
  run: |
    npm run start:db
    npm run setup
    npm run start:auth &
    npm run start:user &
    npm run start:meal &
    npm run start:admin &
    sleep 10
    npm test
```
