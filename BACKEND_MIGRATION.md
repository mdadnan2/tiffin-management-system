# Backend Migration to `backend/` Directory

## ✅ Migration Complete!

All backend code has been successfully moved to the `backend/` directory.

## 📁 New Structure

```
tiffin-management/
├── backend/                    # All backend services
│   ├── apps/                  # Microservices
│   │   ├── auth-service/
│   │   ├── user-service/
│   │   ├── meal-service/
│   │   └── admin-service/
│   ├── libs/                  # Shared libraries
│   ├── prisma/                # Database schema & migrations
│   ├── test/                  # API test files
│   ├── .env                   # Backend environment variables
│   ├── package.json           # Backend dependencies
│   ├── nest-cli.json          # NestJS configuration
│   └── tsconfig.json          # TypeScript configuration
├── frontend/                  # Next.js application
│   ├── src/
│   ├── package.json
│   └── ...
├── docker-compose.yml         # Production Docker setup
├── docker-compose.dev.yml     # Development Docker setup
├── package.json               # Root monorepo scripts
└── README.md
```

## 🚀 Updated Commands

### Installation (First Time)

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Or install individually
npm install              # Root
cd backend && npm install
cd frontend && npm install
```

### Development (Local)

```bash
# Start database and Consul
npm run start:db

# Run migrations and seed (first time only)
npm run setup

# Start services (in separate terminals)
npm run start:auth
npm run start:user
npm run start:meal
npm run start:admin
npm run start:frontend
```

### Docker Commands

```bash
# Production mode
npm run docker:build      # Build and start all services
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
npm run docker:logs       # View logs
npm run docker:setup      # Setup database (first time)

# Development mode (with hot reload)
npm run docker:dev:build  # Build and start with hot reload
npm run docker:dev        # Start dev services
npm run docker:dev:down   # Stop dev services
npm run docker:dev:logs   # View dev logs
npm run docker:dev:setup  # Setup database (first time)
```

### Database Commands

```bash
npm run migrate           # Run migrations
npm run seed              # Seed demo users
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
```

### Build Commands

```bash
npm run build:backend     # Build all backend services
npm run build:frontend    # Build frontend
npm run build:all         # Build everything
```

### Utility Commands

```bash
npm run check             # Check Consul registered services
```

## 🔧 What Changed

### 1. File Locations
- ✅ `apps/` → `backend/apps/`
- ✅ `libs/` → `backend/libs/`
- ✅ `prisma/` → `backend/prisma/`
- ✅ `test/` → `backend/test/`
- ✅ Backend `.env` → `backend/.env`
- ✅ `nest-cli.json` → `backend/nest-cli.json`
- ✅ Backend `package.json` → `backend/package.json`

### 2. Docker Compose
- ✅ Updated build contexts: `context: ./backend`
- ✅ Updated volume mounts: `./backend/apps/...`
- ✅ Both `docker-compose.yml` and `docker-compose.dev.yml` updated

### 3. Scripts
- ✅ Root `package.json` now delegates to backend/frontend
- ✅ All commands work from root directory
- ✅ No need to `cd` into directories manually

## ⚠️ Important Notes

### Environment Variables
- Backend `.env` is now at `backend/.env`
- Frontend `.env.local` is at `frontend/.env.local`
- Make sure both files exist with correct values

### Database Connection
- Local development: `postgresql://postgres:root@localhost:5432/tiffin_db`
- Docker: `postgresql://postgres:root@db:5432/tiffin_db`

### Prisma Commands
- Always run from root: `npm run migrate`, `npm run seed`
- Or from backend directory: `cd backend && npx prisma migrate dev`

## 🧪 Testing the Setup

### 1. Verify Structure
```bash
dir backend\apps
dir frontend\src
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Start Database
```bash
npm run start:db
```

### 4. Setup Database
```bash
npm run setup
```

### 5. Start Services
```bash
# Option A: Docker (Recommended)
npm run docker:dev:build

# Option B: Local Development
npm run start:auth     # Terminal 1
npm run start:user     # Terminal 2
npm run start:meal     # Terminal 3
npm run start:admin    # Terminal 4
npm run start:frontend # Terminal 5
```

### 6. Verify Services
```bash
npm run check
```

Visit:
- Frontend: http://localhost:3000
- Consul UI: http://localhost:8500/ui
- Auth Service: http://localhost:3001/auth/health
- User Service: http://localhost:3002/users/health
- Meal Service: http://localhost:3003/meals/health
- Admin Service: http://localhost:3004/admin/health

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
npm run prisma:generate
```

### Docker build fails
```bash
npm run docker:down
npm run docker:build
```

### Database connection issues
```bash
# Check if database is running
docker ps | findstr tiffin-db

# Restart database
docker-compose restart db
```

### Port conflicts
```bash
# Check what's using the port
netstat -ano | findstr :3001

# Kill the process
taskkill /F /PID <PID>
```

## ✨ Benefits of New Structure

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Independent Development**: Each can be developed/deployed independently
3. **Better Organization**: Easier to navigate and understand
4. **Scalability**: Easy to add more services or frontends
5. **Standard Practice**: Follows industry-standard monorepo structure

## 📝 Next Steps

1. Update your IDE workspace settings if needed
2. Update any CI/CD pipelines to use new paths
3. Update documentation references to old paths
4. Consider adding workspace-level scripts for common tasks

## 🎉 You're All Set!

The migration is complete. All functionality remains the same, just better organized!

For any issues, refer to the main [README.md](README.md) or check the troubleshooting section above.
