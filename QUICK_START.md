# Quick Start Guide

## Issue: Frontend Connection Reset in Docker

The frontend runs slowly in Docker due to Next.js compilation overhead. **Run it locally instead.**

## Solution: Run Backend in Docker, Frontend Locally

### 1. Start Backend Services (Docker)
```bash
# Start all backend services
docker-compose up -d db consul auth-service user-service meal-service admin-service

# Setup database (first time only - if not already done)
docker cp backend/seed-docker.js tiffin-auth:/app/seed-docker.js
docker-compose exec auth-service node seed-docker.js
```

**Note**: Services take 10-15 seconds to fully start. Wait before testing.

### 2. Start Frontend (Local)
```bash
# Option A: Use batch script
start-frontend.bat

# Option B: Manual
cd frontend
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Consul UI: http://localhost:8500/ui
- Auth API: http://localhost:3001
- User API: http://localhost:3002
- Meal API: http://localhost:3003
- Admin API: http://localhost:3004

### 4. Login Credentials
- **User**: demo@tiffin.com / demo123
- **Admin**: admin@tiffin.com / demo123

## Check Services
```bash
# View all running containers
docker-compose ps

# View logs
docker-compose logs -f auth-service

# Check Consul
npm run check
```

## Stop Services
```bash
# Stop all Docker services
docker-compose down

# Stop frontend (Ctrl+C in terminal)
```
