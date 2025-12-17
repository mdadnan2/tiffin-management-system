# Development Guide - Tiffin Management System

## 🚀 Quick Start (3 Steps)

### First Time Setup
```bash
# 1. Run initial setup
setup.bat

# 2. Start all services
start-all.bat

# 3. Verify everything is working
health-check.bat
```

## 📋 Available Scripts

### Setup & Initialization
- `setup.bat` - Complete initial setup (dependencies, database, build)
- `npm run install:all` - Install all dependencies
- `npm run setup` - Setup database (migrations + seed)

### Development (Local)
- `start-all.bat` - Start all services in separate terminals
- `stop-all.bat` - Stop all services
- `health-check.bat` - Check service health
- `test-api.bat` - Quick API endpoint test

### Docker Development
- `npm run docker:up` - Start all services with Docker
- `npm run docker:build` - Build and start with Docker
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker logs

### Individual Services
- `npm run start:auth` - Auth Service (3001)
- `npm run start:user` - User Service (3002)
- `npm run start:meal` - Meal Service (3003)
- `npm run start:admin` - Admin Service (3004)
- `npm run start:frontend` - Frontend (3000)

## 🏗️ Development Workflow

### Option A: Local Development (Recommended for Backend Development)
```bash
# 1. Start database and Consul
docker-compose up -d db consul

# 2. Start services individually
start-all.bat

# 3. Start frontend separately
cd frontend && npm run dev
```

### Option B: Docker Development (Recommended for Full Stack)
```bash
# 1. Start everything with Docker
npm run docker:build

# 2. Setup database (first time)
npm run docker:setup

# 3. View logs
npm run docker:logs
```

## 🔧 Development Tips

### Hot Reload
- **Local**: All services have `--watch` flag enabled
- **Docker**: Use `docker-compose.dev.yml` for hot reload

### Debugging
- Use VS Code debugger with launch configurations
- Check logs: `docker-compose logs -f [service-name]`
- Use Consul UI: http://localhost:8500/ui

### Database Management
```bash
# View database
npm run prisma:studio

# Create migration
cd backend && npx prisma migrate dev --name [migration-name]

# Reset database
cd backend && npx prisma migrate reset
```

### API Testing
- Use `.http` files in `backend/test/` with REST Client extension
- Or use Postman collection
- Quick test: `test-api.bat`

## 📡 Service Architecture

```
Frontend (3000) → API Gateway → Microservices
                     ↓
                 Consul (8500) ← Services register here
                     ↓
    Auth(3001) User(3002) Meal(3003) Admin(3004)
                     ↓
                PostgreSQL (5432)
```

## 🔐 Authentication Flow

1. **Register/Login** → Auth Service (3001)
2. **Get JWT Token** → Include in Authorization header
3. **Access Protected Routes** → All services validate JWT
4. **Refresh Token** → When access token expires

## 📊 Monitoring

### Service Health
- Consul UI: http://localhost:8500/ui
- Health endpoints: `/[service]/health`
- Script: `health-check.bat`

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
netstat -ano | findstr :3001

# Kill process
taskkill /f /pid [PID]
```

### Service Won't Start
1. Check if database is running: `docker-compose ps`
2. Check if Consul is running: `curl http://localhost:8500/v1/status/leader`
3. Rebuild service: `npm run build:[service-name]`
4. Check logs: `docker-compose logs [service-name]`

### Database Issues
```bash
# Restart database
docker-compose restart db

# Check database connection
docker exec tiffin-db pg_isready -U postgres

# Reset database
cd backend && npx prisma migrate reset
```

### Frontend Issues
```bash
# Clear Next.js cache
cd frontend && rm -rf .next

# Reinstall dependencies
cd frontend && rm -rf node_modules && npm install
```

## 🧪 Testing

### Manual Testing
1. Use `test-api.bat` for quick checks
2. Use `.http` files in `backend/test/`
3. Use Postman collection

### Demo Credentials
- **User**: demo@tiffin.com / demo123
- **Admin**: admin@tiffin.com / demo123

### Test Scenarios
1. **User Registration** → POST /auth/register
2. **User Login** → POST /auth/login
3. **Create Meal** → POST /meals
4. **View Dashboard** → GET /dashboard
5. **Admin Access** → GET /admin/users

## 📝 Code Structure

### Backend Services
```
backend/apps/
├── auth-service/     # Authentication & JWT
├── user-service/     # User profiles & prices
├── meal-service/     # Meals & dashboard
└── admin-service/    # Admin monitoring
```

### Shared Libraries
```
backend/libs/common/
├── decorators/       # @CurrentUser, @Roles
├── guards/          # RolesGuard
└── consul-client.ts # Service registration
```

### Frontend
```
frontend/src/
├── app/             # Next.js app router
├── components/      # Reusable components
├── lib/            # Utilities & API clients
└── types/          # TypeScript types
```

## 🔄 Development Process

### Adding New Features
1. **Plan** → Define API endpoints
2. **Backend** → Create service/controller/dto
3. **Database** → Update Prisma schema if needed
4. **Frontend** → Create components/pages
5. **Test** → Use .http files or manual testing

### Making Changes
1. **Local Development** → Use `start-all.bat`
2. **Hot Reload** → Changes auto-reload
3. **Test** → Use `test-api.bat` or .http files
4. **Docker** → Test with `npm run docker:build`

## 📚 Next Steps

### Phase 4 Features (Planned)
- [ ] Multi-day meal scheduling
- [ ] Email notifications
- [ ] Billing system
- [ ] WebSocket real-time updates
- [ ] Mobile app API
- [ ] Advanced analytics

### Infrastructure Improvements
- [ ] Redis caching
- [ ] Message queues (RabbitMQ)
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment
- [ ] Monitoring (Prometheus/Grafana)

## 🆘 Getting Help

1. **Check logs** → `docker-compose logs -f`
2. **Health check** → `health-check.bat`
3. **Consul UI** → http://localhost:8500/ui
4. **API test** → `test-api.bat`
5. **Documentation** → README.md files

---

**Happy Coding! 🚀**