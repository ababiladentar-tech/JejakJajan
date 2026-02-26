# Setup Guide - JejakJajan

## Prerequisites

### System Requirements
- Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- Docker & Docker Compose
- Or: Node.js 18+, npm 9+, PostgreSQL 15+

### Hardware Requirements
- 4GB RAM minimum
- 10GB free disk space
- Internet connection

---

## Option 1: Docker Compose (Recommended)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd JejakJajan
```

### Step 2: Configure Environment
```bash
# Copy example env to actual env
cp backend/.env.example backend/.env

# Edit backend/.env if needed (defaults work for Docker)
# Important variables:
# - DATABASE_URL: Already set for Docker (postgres service)
# - JWT_SECRET: Generate a secure random key for production
# - CORS_ORIGIN: Set to your frontend URL
```

### Step 3: Start Services
```bash
# Build and start all services
docker compose up -d

# Check if all services are running
docker compose ps

# Expected output:
# NAME                  STATUS
# jejak_jajan_postgres  running
# jejak_jajan_backend   running
# jejak_jajan_frontend  running
```

### Step 4: Access Application
```
Frontend:  http://localhost (or http://localhost:3000)
Backend:   http://localhost:5000
API Docs:  http://localhost:5000/health
Database:  localhost:5432
```

### Step 5: Test Application
```bash
# Check backend health
curl http://localhost:5000/health
# Expected: {"status":"OK"}

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "BUYER"
  }'
```

### Useful Docker Commands
```bash
# View logs
docker compose logs -f backend      # Backend logs
docker compose logs -f frontend     # Frontend logs
docker compose logs -f postgres     # Database logs

# Stop services
docker compose down

# Rebuild images
docker compose build

# Remove everything (clean slate)
docker compose down -v              # Also removes volumes (database)
```

---

## Option 2: Development Setup (Without Docker)

### Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Database

**On Windows (PowerShell):**
```powershell
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql15

# Create database
$env:PGPASSWORD = "your_password"
psql -U postgres -c "CREATE DATABASE jejak_jajan_db;"
psql -U postgres -d jejak_jajan_db -c "CREATE SCHEMA IF NOT EXISTS public;"
```

**On macOS:**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb -U postgres jejak_jajan_db
```

**On Linux (Ubuntu):**
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb jejak_jajan_db
```

#### Step 3: Configure Environment
```bash
# Copy example env
cp .env.example .env

# Edit .env
# Windows users: use Notepad or VSCode
# Mac/Linux: use nano or vim
nano .env
```

**Set these variables:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jejak_jajan_db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
SOCKET_CORS=http://localhost:5173
```

#### Step 4: Setup Database Schema
```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

#### Step 5: Start Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Expected output:
# Server running on port 5000
# Environment: development
```

### Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Start Development Server
```bash
# Start Vite dev server
npm run dev

# Expected output:
# VITE v5.0.8  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

#### Step 3: Access Application
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## Configuration

### Backend Environment Variables

```env
# Server
PORT=5000                                    # API port
NODE_ENV=development|production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-secret-key                  # Change in production!
JWT_EXPIRE=7d                               # Token expiry

# CORS & WebSocket
CORS_ORIGIN=http://localhost:5173           # Frontend URL
SOCKET_CORS=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880                       # 5MB in bytes
UPLOAD_DIR=./uploads

# Optional: Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key
```

### Frontend Configuration

No configuration needed! Update API URL in [src/services/api.js](../frontend/src/services/api.js) if needed:

```javascript
const API_URL = '/api'; // Relative URL works with proxy
```

---

## Database Setup

### Create Tables (Prisma)
```bash
# Automatic (recommended)
npx prisma migrate dev

# Or manually run SQL
psql -U postgres -d jejak_jajan_db -f schema.sql
```

### View Database Schema
```bash
# Open Prisma Studio (visual database explorer)
npx prisma studio

# Access at: http://localhost:5555
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

---

## Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "test123",
    "role": "BUYER"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "test123"
  }'
```

### Test WebSocket Connection
```bash
# Using Socket.io test client
# Or install: npm install -g socket.io-client

# JavaScript:
const io = require('socket.io-client');
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('vendor:location', { 
    latitude: -6.2088, 
    longitude: 106.8456 
  });
});
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows: Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -d jejak_jajan_db

# If connection refused, check DATABASE_URL in .env
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear build cache (Vite)
rm -rf dist
npm run build

# Clear Prisma cache
rm -rf .prisma
npx prisma generate
```

### CORS Errors
- Check CORS_ORIGIN in backend .env
- Ensure frontend URL matches exactly (with http://)
- Restart backend server after changing .env

### WebSocket Connection Failed
- Check Socket.io CORS settings
- Verify backend is running
- Check browser console for errors
- Ensure token is valid

### Database Migration Issues
```bash
# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name describe_change

# Resolve conflicts
npx prisma migrate resolve --rolled-back create_users
```

---

## Development Workflow

### Backend Development
1. Make changes in `backend/src/`
2. Save file (auto-reload with nodemon)
3. Test with curl or API client
4. Check console for errors

### Frontend Development
1. Make changes in `frontend/src/`
2. Save file (auto-reload with Vite)
3. Check browser DevTools for errors
4. Hot Module Replacement (HMR) updates instantly

### Database Changes
```bash
# After modifying schema.prisma:
npx prisma migrate dev --name describe_changes

# Or generate without migration:
npx prisma generate
```

---

## Production Deployment

### Pre-deployment Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS_ORIGIN
- [ ] Set up logging/monitoring
- [ ] Configure email service (if needed)
- [ ] Run database backups
- [ ] Test all features

### Using Docker Compose in Production
```bash
# Set production environment
export NODE_ENV=production

# Build with specific tag
docker compose build --build-arg NODE_ENV=production

# Run with production settings
docker compose -f docker-compose.yml up -d

# View logs
docker compose logs -f
```

### Security Hardening
```bash
# Change default passwords
# Update JWT_SECRET to random 32+ char string
# Configure firewall rules
# Set up SSL/TLS certificate
# Enable rate limiting
# Configure backup strategy
```

---

## Performance Optimization

### Backend
```javascript
// Enable compression
app.use(compression());

// Connection pooling
DATABASE_URL="postgresql://user:pass@host/db?pool_size=20"

// Caching headers
app.use(express.static('public', {
  maxAge: 3600000 // 1 hour
}));
```

### Frontend
```javascript
// Code splitting
const LazyComponent = lazy(() => import('./Component'));

// Image optimization
<img src={img} loading="lazy" alt="..." />

// Build optimization
npm run build  // Check bundle size
```

### Database
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_orders_buyer_date ON orders(buyer_id, created_at);
```

---

## Monitoring & Logs

### Backend Logs
```bash
# Docker
docker compose logs -f backend

# Development
# Logged to console automatically
```

### Database Logs
```bash
# View PostgreSQL logs
docker compose exec postgres psql -U postgres -d jejak_jajan_db -c \
  "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Frontend Logs
```bash
# Check browser console (F12)
# View Network tab for API calls
# Check Storage for JWT token
```

---

## Next Steps

1. **Customize Branding**: Update colors, logo, app name
2. **Add Maps API Key**: For advanced map features
3. **Setup Email**: For notifications and password reset
4. **Enable Payments**: Integrate payment gateway
5. **Launch Testing**: Invite beta users
6. **Setup Monitoring**: Configure error tracking

---

## Support & Resources

- **Documentation**: See `docs/` folder
- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Algorithms**: [ALGORITHMS.md](./ALGORITHMS.md)
- **GitHub Issues**: Report bugs and request features

---

**Last Updated**: February 2026  
**Version**: 1.0.0
