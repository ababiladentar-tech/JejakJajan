# System Architecture

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌─────────────────┐                ┌─────────────────────┐  │
│  │  React + Vite   │                │   Leaflet Map       │  │
│  │  TailwindCSS    │ ←─ Socket.io ─→│   Real-time Update  │  │
│  │  Zustand Store  │                │   GPS Tracking      │  │
│  └─────────────────┘                └─────────────────────┘  │
└────────────────────────────────────────────────────────────┬─┘
                         │ HTTP/WebSocket
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVER LAYER                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Express.js + Node.js                     │    │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────┐   │    │
│  │  │ API Routes │  │ Middleware│ │ Controllers │   │    │
│  │  └────────────┘  └──────────┘  └────────────┘   │    │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────┐   │    │
│  │  │  Services  │  │ Socket.io │  │ Algorithms │   │    │
│  │  └────────────┘  └──────────┘  └────────────┘   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Authentication                      │    │
│  │  JWT Token │ Password Hash │ RBAC               │    │
│  └──────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────────┬───────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────┐     ┌──────────────────────────┐
│   PostgreSQL Database   │     │    File Storage          │
│  ┌─────────────────────┐│     │  ┌────────────────────┐  │
│  │ Users               ││     │  │ /uploads           │  │
│  │ Vendors             ││     │  │ - Profile images   │  │
│  │ Menus               ││     │  │ - Menu images      │  │
│  │ Orders              ││     │  │ - Documents        │  │
│  │ Reviews             ││     │  └────────────────────┘  │
│  │ LocationHistory     ││     │                          │
│  │ UserFollowers       ││     │                          │
│  │ VendorStats         ││     │                          │
│  └─────────────────────┘│     │                          │
└─────────────────────────┘     └──────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer (Frontend)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Maps**: Leaflet + OpenStreetMap

### 2. Application Layer (Backend)
- **Framework**: Express.js
- **Runtime**: Node.js
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer

### 3. Business Logic Layer
- Controllers: Handle HTTP requests/responses
- Services: Core business logic
- Algorithms: Geolocation, clustering, predictions
- Middleware: Auth, validation, error handling

### 4. Data Access Layer
- Prisma ORM
- PostgreSQL
- Query optimization with indexes
- Transaction support

### 5. Infrastructure
- Docker containers
- Docker Compose orchestration
- PostgreSQL database
- Nginx reverse proxy

## Component Interaction

### Registration & Authentication Flow
```
User Input
    ↓
Register/Login Component
    ↓
API Service (axios)
    ↓
Backend: authController
    ↓
Password Hashing (bcrypt)
    ↓
Database: Create User
    ↓
JWT Token Generation
    ↓
Token stored in localStorage
    ↓
Authentication Context Updated
    ↓
Route Protection Applied
```

### Vendor Location Tracking Flow
```
Vendor Device
    ↓
GPS Location (every 5 seconds)
    ↓
Socket.io: emit vendor:location
    ↓
Backend: socketHandler
    ↓
Update Vendor Location
    ↓
Save to LocationHistory
    ↓
Broadcast to Connected Buyers
    ↓
Real-time Map Update
    ↓
Haversine Distance Calculation
    ↓
Notify if within radius
```

### Order Flow
```
Buyer: Select Items
    ↓
Add to Cart (Zustand Store)
    ↓
Place Order (API)
    ↓
Backend: Create Order + OrderItems
    ↓
Update Vendor Stats
    ↓
Socket.io: Notify Vendor
    ↓
Vendor: Accept/Reject
    ↓
Socket.io: Update Buyer
    ↓
Real-time Order Tracking
```

## Data Models Relationship

```
User (1) ──────────────→ (1) Vendor
  │                        ├──→ (N) Menus
  ├─→ (N) Orders          ├──→ (N) Orders
  ├─→ (N) Reviews         ├──→ (N) Reviews
  ├─→ (N) UserFollowers   └──→ (N) LocationHistory
  └─→ (N) Notifications   └──→ (1) VendorStats

Order (1) ──→ (N) OrderItems
             ↓
          Menus (1)

Review (1) ──→ Order (1) [UNIQUE]
```

## API Gateway Pattern

```
Client Request
    ↓
Nginx (Reverse Proxy)
    ↓
Express Router
    ↓
Authentication Middleware
    ├─ No Token → 401 Unauthorized
    └─ Invalid Token → 401 Invalid Token
    ↓
Authorization Middleware (RBAC)
    ├─ Missing Role → 403 Forbidden
    └─ Role Match → Continue
    ↓
Validation Middleware
    ├─ Invalid Input → 400 Bad Request
    └─ Valid → Continue
    ↓
Route Handler (Controller)
    ↓
Business Logic (Service)
    ↓
Database Query (Prisma)
    ↓
Response Formatter
    ↓
HTTP Response
```

## Scalability Considerations

### Current Implementation
- ✅ Monolithic architecture (simple deployment)
- ✅ Connection pooling (Prisma)
- ✅ Database indexing
- ✅ JWT stateless auth
- ✅ WebSocket for real-time

### Future Improvements (Roadmap)
- 📋 Microservices split:
  - Auth Service
  - Vendor Service
  - Order Service
  - Location Service
- 📋 Redis caching layer
- 📋 Message queue (RabbitMQ/Kafka)
- 📋 Load balancing (Nginx)
- 📋 Kubernetes deployment
- 📋 CDN for static assets
- 📋 Database replication & sharding

## Security Measures

### Authentication
- JWT tokens with expiration (7 days)
- bcryptjs for password hashing
- Token stored securely (localStorage)
- CORS validation

### Authorization
- Role-based access control (RBAC)
- Protected routes & endpoints
- Vendor can only edit own data
- Admin-only admin endpoints

### Input Validation
- Request validation middleware
- SQL injection prevention (Prisma)
- File upload validation
- Type checking with Prisma schema

### Data Protection
- HTTPS-ready infrastructure
- SQL parameterized queries
- Password encryption
- Sensitive data not in logs

## Performance Optimization

### Frontend
- Code splitting with Vite
- Image lazy loading
- Memoization with React.memo
- Zustand for efficient state management
- Skeleton loading for better UX

### Backend
- Connection pooling
- Database indexes on frequently queried fields
- Caching with in-memory Map for active vendors
- Pagination for list endpoints
- Select specific fields in queries

### Database
```sql
-- Key indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_userid ON vendors(user_id);
CREATE INDEX idx_location_history_vendor_date ON location_history(vendor_id, created_at);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
```

## Monitoring & Logging

### Frontend
- Error tracking (future: Sentry)
- Performance monitoring
- User analytics (future)

### Backend
- Console logging
- Request logging (future: Winston/Morgan)
- Error tracking (future: Sentry)
- Database query logging (Prisma)

## Disaster Recovery

### Backup Strategy
- Daily database backups
- Automated backup to cloud storage
- Point-in-time recovery capability

### High Availability (Future)
- Database replication
- Multiple app server instances
- Load balancing
- Auto-scaling policies

---

**Version**: 1.0  
**Last Updated**: February 2026
