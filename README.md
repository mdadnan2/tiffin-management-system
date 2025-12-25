# Tiffin Management System

A full-stack meal management application built with **NestJS**, **Prisma**, **PostgreSQL**, and **Next.js**. This project demonstrates a production-ready microservice architecture with service discovery, authentication, role-based access control, and RESTful API design.

> **Note**: This is a portfolio project designed to showcase backend engineering skills, architectural patterns, and best practices. It is not intended for production use.

---

## 📖 Overview

The Tiffin Management System allows users to schedule and manage daily meals (breakfast, lunch, dinner) with automatic pricing, bulk scheduling, and analytics dashboards. Admins can monitor user activity and meal statistics.

**Key Features:**
- User authentication with JWT (access + refresh tokens)
- Role-based access control (USER, ADMIN)
- Meal CRUD operations with bulk scheduling
- Dynamic pricing per user with price locking
- Dashboard analytics with totals and breakdowns
- Service discovery using Consul
- Dockerized development environment

---

## 🛠️ Tech Stack

### Backend (Primary Focus)
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: class-validator, class-transformer
- **Service Discovery**: Consul (Docker Hub)
- **HTTP Client**: Axios
- **Testing**: Jest

### Frontend (Brief)
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database Management**: Prisma Migrate
- **Service Registry**: Consul

---

## 🏗️ Architecture

This project uses a **microservice architecture** with independent services communicating through HTTP. Services register with Consul for discovery and health monitoring.

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Consul (Service Registry)                   │
│                    Port: 8500                                │
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

### Request Flow

```
Client (Next.js) 
  → HTTP Request 
    → NestJS Controller (validation, auth guards)
      → Service Layer (business logic)
        → Prisma Client (ORM)
          → PostgreSQL Database
            → Response back through layers
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| **Auth Service** | 3001 | Registration, login, JWT token management |
| **User Service** | 3002 | User profiles, meal price settings |
| **Meal Service** | 3003 | Meal CRUD, bulk operations, dashboard |
| **Admin Service** | 3004 | Admin monitoring, user statistics |
| **Consul** | 8500 | Service discovery, health checks |
| **Frontend** | 3000 | Next.js web application |

---

## 📁 Backend Folder Structure

```
backend/
├── apps/                           # Microservices (NestJS apps)
│   ├── auth-service/              # Authentication service
│   │   └── src/
│   │       ├── auth/              # Auth module
│   │       │   ├── dto/           # Data transfer objects
│   │       │   ├── strategies/    # Passport strategies (JWT, Local, Refresh)
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   └── auth.module.ts
│   │       ├── prisma/            # Prisma service
│   │       ├── app.module.ts      # Root module
│   │       └── main.ts            # Bootstrap
│   │
│   ├── user-service/              # User management service
│   │   └── src/
│   │       ├── user/              # User CRUD
│   │       ├── price/             # Price settings
│   │       └── ...
│   │
│   ├── meal-service/              # Meal management service
│   │   └── src/
│   │       ├── meal/              # Meal CRUD + bulk operations
│   │       ├── dashboard/         # Analytics
│   │       └── ...
│   │
│   └── admin-service/             # Admin monitoring service
│       └── src/
│           ├── admin/             # Admin endpoints
│           └── ...
│
├── libs/                          # Shared libraries
│   └── common/
│       └── src/
│           ├── decorators/        # Custom decorators (@CurrentUser, @Roles)
│           ├── guards/            # Auth guards (RolesGuard)
│           └── consul-client.ts   # Consul registration logic
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration history
│   └── seed.ts                    # Seed script (demo users)
│
├── test/                          # E2E tests
├── nest-cli.json                  # NestJS monorepo config
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
└── .env                           # Environment variables
```

### Key Directories Explained

- **apps/**: Each service is an independent NestJS application with its own main.ts entry point
- **libs/common/**: Shared code (guards, decorators, utilities) used across services
- **prisma/**: Database schema, migrations, and seed data
- **test/**: API integration tests

---

## ⚙️ Environment Setup

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm** or **yarn**
- **Docker** & **Docker Compose** (for PostgreSQL and Consul)
- **PostgreSQL**: 15+ (if running without Docker)

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://postgres:root@localhost:5432/tiffin_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRATION="7d"

# Consul Service Discovery
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

### Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install backend only
cd backend && npm install
```

---

## 🚀 Running the Project

### Option 1: Docker Compose (Recommended)

Start all services with hot reload enabled:

```bash
# 1. Build and start all services
npm run docker:build

# 2. Setup database (first time only)
npm run docker:setup

# 3. View logs
npm run docker:logs

# For subsequent starts
npm run docker:up

# Stop all services
npm run docker:down
```

Services will be available at:
- **Consul UI**: http://localhost:8500/ui
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Meal Service**: http://localhost:3003
- **Admin Service**: http://localhost:3004
- **Frontend**: http://localhost:3000

### Option 2: Local Development (Without Docker)

Run each service in separate terminals:

```bash
# Terminal 1: Start PostgreSQL and Consul
docker-compose up -d db consul

# Terminal 2: Auth Service
npm run start:auth

# Terminal 3: User Service
npm run start:user

# Terminal 4: Meal Service
npm run start:meal

# Terminal 5: Admin Service
npm run start:admin

# Terminal 6: Frontend (optional)
npm run start:frontend
```

### First-Time Setup

```bash
# 1. Start database
npm run start:db

# 2. Run migrations and seed demo users
npm run setup

# Demo users created:
# - User: demo@tiffin.com / demo123
# - Admin: admin@tiffin.com / demo123
```

---

## 🗄️ Database & Prisma

### Schema Overview

The database schema includes:
- **User**: Authentication, roles, profile
- **PriceSetting**: Per-user meal pricing
- **Meal**: Meal records with date, type, count, price snapshot

### Prisma Workflow

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run migrate

# Apply migrations (production)
npm run migrate:deploy

# Seed database with demo data
npm run seed

# Open Prisma Studio (GUI)
npm run prisma:studio
```

### Updating the Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run migrate` to create migration
3. Run `npm run prisma:generate` to update Prisma Client
4. Restart services

---

## 🔌 API Layer

### Architecture Pattern

Each service follows the **Controller → Service → Repository** pattern:

```
Controller (HTTP layer)
  ↓ validates request with DTOs
Service (Business logic)
  ↓ processes data
Prisma Client (Data access)
  ↓ queries database
PostgreSQL
```

### Example: Meal Creation Flow

```typescript
// 1. Controller receives request
@Post()
@UseGuards(JwtAuthGuard)
async createMeal(@Body() dto: CreateMealDto, @CurrentUser() user) {
  return this.mealService.createMeal(user.id, dto);
}

// 2. Service handles business logic
async createMeal(userId: string, dto: CreateMealDto) {
  const price = await this.getPriceForMealType(userId, dto.mealType);
  return this.prisma.meal.upsert({
    where: { userId_date_mealType: { userId, date: dto.date, mealType: dto.mealType } },
    update: { count: dto.count, priceAtTime: price },
    create: { userId, ...dto, priceAtTime: price }
  });
}
```

### Authentication & Authorization

- **Authentication**: JWT tokens validated by `JwtAuthGuard`
- **Authorization**: Role-based access with `RolesGuard` and `@Roles()` decorator
- **Current User**: Extracted via `@CurrentUser()` decorator

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: User) {
  return user;
}

@Get('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async getAllUsers() {
  return this.adminService.getAllUsers();
}
```

### Validation

All DTOs use `class-validator`:

```typescript
export class CreateMealDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsInt()
  @Min(1)
  count: number;
}
```

### Error Handling

NestJS built-in exception filters handle errors:
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)

---

## 📜 NPM Scripts

### Setup & Database
```bash
npm run start:db          # Start PostgreSQL with Docker
npm run setup             # Run migrations + seed
npm run migrate           # Create and apply migration
npm run seed              # Seed demo users
npm run prisma:generate   # Generate Prisma Client
npm run prisma:studio     # Open Prisma Studio GUI
```

### Development
```bash
npm run start:auth        # Start Auth Service (3001)
npm run start:user        # Start User Service (3002)
npm run start:meal        # Start Meal Service (3003)
npm run start:admin       # Start Admin Service (3004)
npm run start:frontend    # Start Next.js frontend (3000)
npm run check             # Check Consul registered services
```

### Build
```bash
npm run build:all         # Build all services
npm run build:auth        # Build specific service
```

### Docker
```bash
npm run docker:build      # Build and start all services
npm run docker:up         # Start all containers
npm run docker:down       # Stop all containers
npm run docker:logs       # View logs
npm run docker:restart    # Restart all services
npm run docker:setup      # Run migrations in Docker
```

### Code Quality
```bash
npm run lint              # Lint code
npm run format            # Format with Prettier
npm run test              # Run tests
```

---

## 🌐 Frontend (Brief)

The frontend is built with **Next.js 14** and **TypeScript**.

### Running Frontend

```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:3000

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios (API calls)

---

## 📡 API Documentation

### Authentication Endpoints

```bash
# Register
POST /auth/register
Body: { "email", "password", "name", "role" }

# Login
POST /auth/login
Body: { "email", "password" }
Response: { "accessToken", "refreshToken", "user" }

# Refresh Token
POST /auth/refresh
Body: { "refreshToken" }

# Get Current User
GET /auth/me
Headers: Authorization: Bearer <token>
```

### User Endpoints

```bash
# Get own profile
GET /users/profile
Headers: Authorization: Bearer <token>

# Update own profile
PATCH /users/profile
Headers: Authorization: Bearer <token>
Body: { "name": "New Name" }

# List all users (admin only)
GET /users
Headers: Authorization: Bearer <token>
```

### Price Settings Endpoints

```bash
# Get own meal prices
GET /users/me/price
Headers: Authorization: Bearer <token>

# Update own meal prices
PATCH /users/me/price
Headers: Authorization: Bearer <token>
Body: { "breakfast": 50, "lunch": 80, "dinner": 70, "custom": 100 }
```

### Meal Endpoints

```bash
# Create or update meal
POST /meals
Headers: Authorization: Bearer <token>
Body: { "date": "2024-01-15", "mealType": "LUNCH", "count": 2 }

# Create bulk meals
POST /meals/bulk
Headers: Authorization: Bearer <token>
Body: { "startDate": "2024-01-15", "endDate": "2024-01-19", "mealType": "LUNCH", "count": 1, "skipWeekends": true }

# List meals
GET /meals?date=2024-01-15&mealType=LUNCH
Headers: Authorization: Bearer <token>

# Update meal
PATCH /meals/:id
Headers: Authorization: Bearer <token>
Body: { "count": 3 }

# Cancel meal
DELETE /meals/:id
Headers: Authorization: Bearer <token>
```

### Dashboard Endpoints

```bash
# Get user dashboard
GET /dashboard
Headers: Authorization: Bearer <token>
Response: { "totalMeals": 10, "byType": { "LUNCH": 5, "DINNER": 5 }, "totalAmount": 750 }
```

### Admin Endpoints

```bash
# Get all users with stats
GET /admin/users
Headers: Authorization: Bearer <token>

# Get user summary
GET /admin/users/:id/summary
Headers: Authorization: Bearer <token>
```

### Health Check Endpoints

```bash
# Consul health
GET http://localhost:8500/v1/status/leader

# Service health
GET /auth/health
GET /users/health
GET /meals/health
GET /admin/health
```

---

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

---

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with short expiration (15 min access, 7 days refresh)
- Role-based access control enforced at service level
- Input validation on all endpoints
- SQL injection prevention via Prisma parameterized queries

**Production Recommendations:**
- Use RS256 (asymmetric) instead of HS256 for JWT
- Implement rate limiting
- Add CORS configuration
- Use HTTPS only
- Store secrets in environment variables or secret managers

---

## 🤝 Contribution Guide

### Code Style
- Follow NestJS conventions
- Use TypeScript strict mode
- Format code with Prettier before committing
- Lint with ESLint

### Branching Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `fix/*`: Bug fixes

### Commit Messages
Use conventional commits:
```
feat: add bulk meal scheduling
fix: resolve JWT refresh token issue
docs: update README with Docker instructions
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:3001 | xargs kill
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db
```

### Service Not Registering with Consul
- Ensure Consul is running: `docker-compose up -d consul`
- Check Consul UI: http://localhost:8500/ui
- Restart the service

---

## 📚 Additional Documentation

- [BACKEND_MIGRATION.md](BACKEND_MIGRATION.md) - Backend reorganization guide
- [CONSUL_SETUP.md](CONSUL_SETUP.md) - Consul setup and usage guide
- [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - Migration and cleanup summary

---

## 📄 License & Disclaimer

This project is licensed under the **MIT License**.

**Disclaimer**: This is a portfolio/demo project created for educational and showcase purposes. It is not intended for production use without proper security hardening, testing, and infrastructure setup.

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using NestJS, TypeScript, Prisma, and Consul**
