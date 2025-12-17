# Tiffin Management System - Service Registry Architecture

A microservice-based backend with service registry for managing tiffin (meal) services built with NestJS, TypeScript, Prisma, PostgreSQL, and Docker.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Service Registry (4000)                     │
│         Service Discovery + Health Monitoring                │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │ Register/Heartbeat
         ┌────────────────┼────────────────┬────────────┐
         │                │                │            │
    ┌────▼───┐       ┌───▼────┐      ┌───▼────┐  ┌───▼────┐
    │ Auth   │       │  User  │      │  Meal  │  │ Admin  │
    │ (3001) │       │ (3002) │      │ (3003) │  │ (3004) │
    └────┬───┘       └────┬───┘      └────┬───┘  └────┬───┘
         │                │                │           │
         └────────────────┴────────────────┴───────────┘
                          │
                   ┌──────▼──────┐
                   │ PostgreSQL  │
                   │   (5432)    │
                   └─────────────┘
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3000 | Next.js web application |
| **Consul** | 8500 | Service discovery, health monitoring (Docker Hub) |
| **Auth Service** | 3001 | User registration, login, JWT token management |
| **User Service** | 3002 | User profiles, price settings |
| **Meal Service** | 3003 | Meal CRUD, dashboard analytics |
| **Admin Service** | 3004 | Admin monitoring, user statistics |
| **PostgreSQL** | 5432 | Shared database for all services |

## 🚀 Tech Stack

- **Framework**: NestJS (Microservices)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Auth**: JWT (HS256) with access & refresh tokens
- **Validation**: class-validator
- **HTTP Client**: Axios (@nestjs/axios)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest

## ✨ Features

### Phase 0-2 Features
- User registration and authentication
- Role-based access control (USER, ADMIN)
- JWT-based authentication (access + refresh tokens)
- Single-day meal management (create, list, update, cancel)
- **Bulk meal scheduling** (multiple dates, date ranges, day filters)
- Meal types: BREAKFAST, LUNCH, DINNER, CUSTOM
- Meal price management per user
- Auto-pricing: meals use current price settings
- User dashboard with totals and breakdowns
- Admin monitoring endpoints
- PostgreSQL persistence

### Phase 3 Features (Consul Integration)
- **Microservice Architecture**: Independent services with clear boundaries
- **Consul Service Registry**: Production-ready service discovery from Docker Hub
- **Auto-Registration**: Services register themselves with Consul on startup
- **Health Monitoring**: Consul performs automatic HTTP health checks
- **Web UI**: Consul dashboard at http://localhost:8500/ui
- **Docker Compose**: Multi-container orchestration for local development
- **Industry Standard**: Using battle-tested Consul instead of custom registry

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## 🛠️ Getting Started

### Quick Start (3 Steps)

```bash
# 1. Install dependencies
npm run install:all

# 2. Setup database (first time only)
npm run start:db
npm run setup

# 3. Start all services
start-all.bat          # Windows (opens 5 terminals)
# OR manually (start Consul first):
docker-compose up -d consul
npm run start:auth     # Terminal 1
npm run start:user     # Terminal 2
npm run start:meal     # Terminal 3
npm run start:admin    # Terminal 4
```

### Environment Setup

Create `.env` file in `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/tiffin_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRATION="7d"
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

### Demo Users

After running `npm run setup`:
- **User**: demo@tiffin.com / demo123
- **Admin**: admin@tiffin.com / demo123

## 🏃 Running the Application

### Option A: Docker Compose (Recommended - Hot Reload Enabled)

Run all services with Docker:

```bash
# 1. Build and start all services (first time)
npm run docker:build

# 2. Setup database (first time only)
npm run docker:setup

# 3. View logs
npm run docker:logs

# For subsequent starts (no rebuild needed)
npm run docker:up

# Stop all services
npm run docker:down

# Restart all services
npm run docker:restart
```

**Hot Reload**: Edit code in `backend/apps/*/src/` and changes auto-reload!

Services will be available at:
- Frontend: http://localhost:3000
- Consul UI: http://localhost:8500/ui
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002
- Meal Service: http://localhost:3003
- Admin Service: http://localhost:3004

### Option B: Local Development (Without Docker)

Run each service in separate terminal windows:

```bash
# Terminal 1: Start database and Consul
docker-compose up -d db consul

# Terminal 2: Frontend
npm run start:frontend

# Terminal 3: Auth Service
npm run start:auth

# Terminal 4: User Service
npm run start:user

# Terminal 5: Meal Service
npm run start:meal

# Terminal 6: Admin Service
npm run start:admin
```

## 📡 API Endpoints

### Service Discovery (Consul)

Discover services from Consul at `http://localhost:8500`

```bash
# Get all registered services
GET http://localhost:8500/v1/catalog/services

# Get service health
GET http://localhost:8500/v1/health/service/auth-service

# Consul UI (recommended)
http://localhost:8500/ui
```

Then call services directly:

### Authentication (Public)

```bash
# Register new user
POST http://localhost:3001/auth/register
Body: { "email": "user@example.com", "password": "password123", "name": "John Doe", "role": "USER" }

# Login
POST http://localhost:3001/auth/login
Body: { "email": "demo@tiffin.com", "password": "demo123" }
Response: { "user": {...}, "accessToken": "...", "refreshToken": "..." }

# Refresh access token
POST http://localhost:3001/auth/refresh
Body: { "refreshToken": "..." }

# Get current user
GET http://localhost:3001/auth/me
Headers: Authorization: Bearer <accessToken>
```

### Users (Private)

```bash
# Get own profile
GET http://localhost:3002/users/profile
Headers: Authorization: Bearer <accessToken>

# Update own profile
PATCH http://localhost:3002/users/profile
Headers: Authorization: Bearer <accessToken>
Body: { "name": "New Name" }

# List all users (admin only)
GET http://localhost:3002/users
Headers: Authorization: Bearer <accessToken>
```

### Price Settings (Private)

```bash
# Get own meal prices
GET http://localhost:3002/users/me/price
Headers: Authorization: Bearer <accessToken>

# Update own meal prices
PATCH http://localhost:3002/users/me/price
Headers: Authorization: Bearer <accessToken>
Body: { "breakfast": 50, "lunch": 80, "dinner": 70, "custom": 100 }

# Get user's prices (admin only)
GET http://localhost:3004/admin/users/:userId/price
Headers: Authorization: Bearer <accessToken>
```

### Meals (Private)

```bash
# Create or update meal
POST http://localhost:3003/meals
Headers: Authorization: Bearer <accessToken>
Body: { "date": "2024-01-15", "mealType": "LUNCH", "count": 2, "note": "Extra spicy" }

# Create bulk meals (multiple dates)
POST http://localhost:3003/meals/bulk
Headers: Authorization: Bearer <accessToken>
Body: { "startDate": "2024-01-15", "endDate": "2024-01-19", "mealType": "LUNCH", "count": 1, "skipWeekends": true }

# List meals (with optional filters)
GET http://localhost:3003/meals?date=2024-01-15&mealType=LUNCH
Headers: Authorization: Bearer <accessToken>

# Update meal
PATCH http://localhost:3003/meals/:id
Headers: Authorization: Bearer <accessToken>
Body: { "count": 3, "note": "Updated note" }

# Update bulk meals
PATCH http://localhost:3003/meals/bulk
Headers: Authorization: Bearer <accessToken>
Body: { "startDate": "2024-01-15", "endDate": "2024-01-19", "mealType": "LUNCH", "count": 2 }

# Cancel meal (soft delete)
DELETE http://localhost:3003/meals/:id
Headers: Authorization: Bearer <accessToken>

# Cancel bulk meals
DELETE http://localhost:3003/meals/bulk
Headers: Authorization: Bearer <accessToken>
Body: { "startDate": "2024-01-15", "endDate": "2024-01-19", "mealType": "LUNCH" }
```

### Dashboard (Private)

```bash
# Get user dashboard
GET http://localhost:3003/dashboard
Headers: Authorization: Bearer <accessToken>
Response: { "totalMeals": 10, "byType": { "LUNCH": 5, "DINNER": 5 }, "totalAmount": 750 }
```

### Admin (Admin Only)

```bash
# Get all users with stats
GET http://localhost:3004/admin/users
Headers: Authorization: Bearer <accessToken>

# Get user summary
GET http://localhost:3004/admin/users/:id/summary
Headers: Authorization: Bearer <accessToken>
```

### Health Checks

```bash
# Consul health
GET http://localhost:8500/v1/status/leader

# Individual service health
GET http://localhost:3001/auth/health
GET http://localhost:3002/users/health
GET http://localhost:3003/meals/health
GET http://localhost:3004/admin/health
```

## ✅ Verify Services

Check all registered services:

```bash
npm run check
```

Shows all services with their health status.

## 🧪 Testing the System

### 1. Login

```bash
# Login directly
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@tiffin.com","password":"demo123"}'
```

Save the `accessToken` from response.

### 2. Create Meal

```bash
curl -X POST http://localhost:3003/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"date":"2024-01-15","mealType":"LUNCH","count":2}'
```

### 3. Get Dashboard

```bash
curl -X GET http://localhost:3003/dashboard \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Admin Access (Login as admin first)

```bash
# Login as admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tiffin.com","password":"demo123"}'

# Get all users
curl -X GET http://localhost:3004/admin/users \
  -H "Authorization: Bearer <adminAccessToken>"
```

## 🗂️ Project Structure

```
tiffin-management/
├── backend/                        # Backend services
│   ├── apps/                      # Microservices
│   │   ├── auth-service/         # Auth Service (3001)
│   │   │   └── src/
│   │   │       ├── auth/
│   │   │       │   ├── dto/
│   │   │       │   ├── strategies/    # JWT, Local, Refresh strategies
│   │   │       │   ├── auth.controller.ts
│   │   │       │   ├── auth.service.ts
│   │   │       │   └── auth.module.ts
│   │   │       ├── prisma/
│   │   │       ├── app.module.ts
│   │   │       └── main.ts
│   │   ├── user-service/         # User Service (3002)
│   │   │   └── src/
│   │   │       ├── user/
│   │   │       ├── price/
│   │   │       ├── prisma/
│   │   │       ├── app.module.ts
│   │   │       └── main.ts
│   │   ├── meal-service/         # Meal Service (3003)
│   │   │   └── src/
│   │   │       ├── meal/
│   │   │       ├── dashboard/
│   │   │       ├── prisma/
│   │   │       ├── app.module.ts
│   │   │       └── main.ts
│   │   └── admin-service/        # Admin Service (3004)
│   │       └── src/
│   │           ├── admin/
│   │           ├── prisma/
│   │           ├── app.module.ts
│   │           └── main.ts
│   ├── libs/                     # Shared libraries
│   │   └── common/
│   │       └── src/
│   │           ├── decorators/   # @CurrentUser, @Roles
│   │           ├── guards/       # RolesGuard
│   │           └── consul-client.ts   # Consul service registration
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed script
│   ├── test/                    # API test files
│   ├── nest-cli.json            # Monorepo configuration
│   ├── package.json             # Backend dependencies & scripts
│   ├── tsconfig.json            # TypeScript config
│   ├── .env                     # Backend environment variables
│   └── check-consul.js          # Check Consul registered services
├── frontend/                     # Next.js application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── docker-compose.yml           # Multi-container orchestration
├── docker-compose.dev.yml       # Development with hot reload
├── package.json                 # Root monorepo scripts
└── README.md
```

## 📝 Business Rules

- One meal record per (userId, date, mealType) combination
- Meals can be created/updated using upsert logic
- Cancelled meals are soft-deleted (status = CANCELLED)
- Default meal count is 1
- **Auto-pricing**: When meal is created, priceAtTime is set from user's current PriceSetting
- **Price locking**: Once meal is created, priceAtTime doesn't change even if PriceSetting is updated
- **Dashboard calculation**: totalAmount = SUM(count × priceAtTime) for ACTIVE meals only
- **JWT tokens**: Access token expires in 15 minutes, refresh token in 7 days
- **Service discovery**: Consul manages service locations and health

## 🔒 Security

- JWT tokens signed with HS256 algorithm
- Access tokens: short-lived (15 minutes)
- Refresh tokens: longer-lived (7 days)
- Passwords hashed with bcrypt (10 rounds)
- Each service validates JWT tokens independently
- Services auto-register on startup with heartbeat monitoring
- Role-based access control enforced at service level
- **Production recommendation**: Use RS256 (public/private keys) instead of HS256

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f api-gateway
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart api-gateway

# Check service status
docker-compose ps
```

## 🗄️ Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run migrate

# Deploy migrations (production)
npm run migrate:deploy

# Seed database
npm run seed

# Open Prisma Studio (GUI)
npm run prisma:studio
```

## 🔧 NPM Scripts

### Setup & Database
```bash
npm run start:db          # Start database only
npm run setup             # Run migrations + seed
npm run migrate           # Run migrations
npm run seed              # Seed demo users
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio GUI
```

### Development
```bash
npm run start:registry    # Start Service Registry
npm run start:auth        # Start Auth Service
npm run start:user        # Start User Service
npm run start:meal        # Start Meal Service
npm run start:admin       # Start Admin Service
npm run check             # Check registered services
```

### Build
```bash
npm run build:all         # Build all services
npm run build:registry    # Build specific service
```

### Docker
```bash
npm run docker:up         # Start all with Docker
npm run docker:down       # Stop all containers
npm run docker:logs       # View logs
npm run docker:restart    # Restart all
```

### Code Quality
```bash
npm run lint              # Lint code
npm run format            # Format code
npm run test              # Run tests
```

## 📊 Monitoring & Logging

Consul monitors:
- Service registration/deregistration
- HTTP health checks (every 10 seconds)
- Service health (passing/failing)
- Service metadata

Check services:
```bash
npm run check
# Or visit: http://localhost:8500/ui
```

## 🚧 Known Issues

- **Port conflicts**: If port 8500 is in use, change Consul port in docker-compose.yml
- **Database connection**: Ensure PostgreSQL is running before starting services
- **Service registration**: Start Consul first, then services
- **Docker networking**: Services use `localhost` for local dev, `service-name` for Docker

## 🔮 Future Enhancements (Phase 4+)

- [ ] Client-side load balancing
- [ ] Service versioning support
- [ ] Circuit breakers and retry logic
- [ ] Redis caching for service locations
- [ ] RabbitMQ message queues for async operations
- [ ] Event-driven architecture (meal created → notification)
- [ ] Distributed tracing with Jaeger/Zipkin
- [ ] Centralized logging with ELK stack
- [ ] Service mesh (Istio/Linkerd)
- [ ] Kubernetes deployment with service discovery
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Multi-day meal scheduling
- [ ] Billing and invoice generation
- [ ] Email notifications
- [ ] WebSocket support for real-time updates
- [ ] Separate databases per service (true microservices)

## 📄 License

MIT

## 🆘 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:4000 | xargs kill
```

### Database not running
```bash
docker-compose up -d db
docker-compose logs db
```

### Service won't start
```bash
# Rebuild the service
npm run build:registry  # or build:auth, build:user, etc.
```

### "Service not found" error
- Ensure Consul is running: `http://localhost:8500`
- Check service is registered: `npm run check` or visit Consul UI
- Restart service to re-register

## 📚 Additional Documentation

- [BACKEND_MIGRATION.md](BACKEND_MIGRATION.md) - Backend reorganization guide
- [CONSUL_SETUP.md](CONSUL_SETUP.md) - Consul setup and usage guide
- [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - Migration and cleanup summary

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using NestJS, TypeScript, Prisma, and Service Registry Pattern**
