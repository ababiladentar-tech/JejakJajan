# JejakJajan - Real-time Street Vendor Tracking Application

Aplikasi full-stack modern untuk tracking pedagang kaki lima keliling secara real-time menggunakan peta dengan 3 role utama: Pembeli, Pedagang, dan Admin.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (untuk development)
- PostgreSQL 15+ (untuk development tanpa Docker)

### Dengan Docker Compose (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd JejakJajan

# Configure environment
cp backend/.env.example backend/.env

# Build dan start semua services
docker compose up -d

# Aplikasi akan berjalan di:
# Frontend: http://localhost (atau http://localhost:3000)
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Development Setup (Tanpa Docker)

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Konfigurasi DATABASE_URL di .env
DATABASE_URL=postgresql://user:password@localhost:5432/jejak_jajan_db

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
JejakJajan/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, upload, error handling
│   │   ├── services/         # Business logic services
│   │   ├── socket/          # WebSocket handlers
│   │   ├── algorithms/      # Geolocation, clustering
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration
│   │   └── server.js        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── uploads/             # User uploads
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Socket services
│   │   ├── context/        # Zustand stores
│   │   ├── utils/          # Helper functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── ALGORITHMS.md
│   └── SETUP_GUIDE.md
└── README.md
```

## 🔐 Sistem Autentikasi

### Fitur
- Registration untuk Pembeli dan Pedagang
- Login dengan JWT token
- Role-based access control (BUYER, VENDOR, ADMIN)
- Protected routes & endpoints
- Token expiry management

### Flow
1. User register dengan role (BUYER/VENDOR)
2. Password di-hash menggunakan bcrypt
3. JWT token digenerate dan disimpan di localStorage
4. Token dikirim di setiap request via Authorization header
5. Backend verify token di middleware

## 👤 Fitur Per Role

### 🛒 Pembeli (BUYER)
- Melihat peta dengan marker pedagang aktif
- Filter vendor berdasarkan kategori makanan
- Follow pedagang favorit
- Notifikasi jika pedagang dalam radius 500m
- Pre-order makanan
- Melihat estimasi waktu kedatangan (ETA)
- Memberikan rating dan review
- Tracking real-time lokasi pedagang via WebSocket

### 👨‍🍳 Pedagang (VENDOR)
- Login dan setup profil toko
- GPS tracking aktif setiap 5 detik
- Update lokasi real-time via Socket.io
- Upload foto dagangan
- Tambah/edit menu dan harga
- Update status (ACTIVE/INACTIVE/RESTING)
- Menerima dan manage pre-order
- Melihat jumlah follower
- Dashboard penjualan

### 👨‍💼 Admin (ADMIN)
- Dashboard statistik lengkap
- Heatmap lokasi ramai
- Verifikasi pedagang baru
- Suspend akun yang melanggar
- Melihat laporan transaksi
- Analisa rute pedagang
- User management

## 🗺️ Fitur Map

### Teknologi
- Leaflet.js untuk rendering peta
- OpenStreetMap untuk map tiles
- Custom markers untuk tiap vendor
- Real-time marker movement via WebSocket

### Marker Popup
- Nama pedagang
- Menu dan harga
- Status (ACTIVE/RESTING/INACTIVE)
- Rating & review count
- Distance dari user

### Interaksi
- Click marker untuk detail vendor
- Pan & zoom untuk navigasi
- Real-time update lokasi pedagang
- User location tracking

## 🧮 Algoritma & Fitur Lanjutan

### 1. Haversine Formula (Distance Calculation)
```javascript
Menghitung jarak antara 2 koordinat GPS
- Input: lat1, lon1, lat2, lon2
- Output: distance dalam meter
- Digunakan untuk: geofencing, nearby search
```

### 2. Vendor Clustering
```javascript
Mengelompokkan vendor berdasarkan proximity
- Radius: 500m (customizable)
- Output: clusters dengan center point
- Gunakan untuk: performa map, heatmap
```

### 3. Linear Regression (Predictive Analytics)
```javascript
Prediksi lokasi ramai berdasarkan histori
- Input: historical sales data
- Output: peak hours, busy locations
- Digunakan untuk: admin analytics
```

### 4. Heatmap Generation
```javascript
Visualisasi area ramai dengan grid-based system
- Grid size: 0.01 degrees (~1km)
- Intensity: berdasarkan jumlah penjualan
- Digunakan untuk: admin dashboard
```

## 📊 Database Schema

### Users Table
- id (String, PK)
- name
- email (UNIQUE)
- password (hashed)
- role (BUYER/VENDOR/ADMIN)
- avatar
- isActive
- createdAt, updatedAt

### Vendors Table
- id (String, PK)
- userId (FK)
- storeName
- description
- category
- latitude, longitude
- status (ACTIVE/INACTIVE/RESTING)
- rating
- totalReviews
- isVerified
- isSuspended
- followerCount
- totalSales

### Menus Table
- id (String, PK)
- vendorId (FK)
- name
- description
- price
- image
- isAvailable
- createdAt, updatedAt

### Orders Table
- id (String, PK)
- buyerId (FK)
- vendorId (FK)
- totalPrice
- status (PENDING/CONFIRMED/COMPLETED/CANCELLED)
- notes
- estimatedETA
- createdAt, updatedAt

### Reviews Table
- id (String, PK)
- buyerId (FK)
- vendorId (FK)
- orderId (FK, UNIQUE)
- rating (1-5)
- comment
- createdAt, updatedAt

### LocationHistory Table
- id (String, PK)
- vendorId (FK)
- latitude
- longitude
- accuracy
- createdAt

### Additional Tables
- UserFollower (followers relationship)
- VendorStats (statistics aggregation)
- NotificationToken (push notifications)

## 🔌 WebSocket Events

### Server emits:
- `vendor:location-update` - Vendor location changed
- `vendor:active-vendors` - List of active vendors
- `vendor:nearby` - Nearby vendors to user
- `order:status-changed` - Order status update
- `error` - Error message

### Client emits:
- `vendor:location` - Update vendor location
- `buyer:join-map` - Buyer joins map view
- `buyer:get-nearby` - Get nearby vendors
- `buyer:follow-vendor` - Follow vendor
- `buyer:unfollow-vendor` - Unfollow vendor
- `order:status-update` - Update order status

## 🛣️ REST API Routes

### Authentication
```
POST   /api/auth/register       - Register user
POST   /api/auth/login          - Login user
GET    /api/auth/profile        - Get user profile
PUT    /api/auth/profile        - Update profile
```

### Vendors
```
POST   /api/vendors             - Create vendor profile
GET    /api/vendors/profile/:id - Get vendor details
PUT    /api/vendors/status      - Update vendor status
PUT    /api/vendors/location    - Update location
GET    /api/vendors/active      - Get all active vendors
GET    /api/vendors/category/:cat - Filter by category
```

### Menus
```
POST   /api/menus               - Create menu item
PUT    /api/menus/:id           - Update menu
DELETE /api/menus/:id           - Delete menu
GET    /api/menus/vendor/:id    - Get vendor menus
```

### Orders
```
POST   /api/orders              - Create order
GET    /api/orders/:id          - Get order details
PUT    /api/orders/:id/status   - Update order status
GET    /api/orders/buyer/list   - Get buyer orders
GET    /api/orders/vendor/list  - Get vendor orders
```

### Reviews
```
POST   /api/reviews             - Create review
GET    /api/reviews/vendor/:id  - Get vendor reviews
PUT    /api/reviews/:id         - Update review
DELETE /api/reviews/:id         - Delete review
```

### Admin
```
GET    /api/admin/dashboard     - Dashboard stats
GET    /api/admin/analytics     - Advanced analytics
GET    /api/admin/heatmap       - Heatmap data
GET    /api/admin/users         - Get all users
PUT    /api/admin/vendors/:id/verify    - Verify vendor
PUT    /api/admin/vendors/:id/suspend   - Suspend vendor
PUT    /api/admin/vendors/:id/unsuspend - Unsuspend vendor
```

## 🎨 UI/UX Design

### Design Principles
- Modern minimal design
- Mobile-first responsive
- Dark/Light mode ready
- Animated transitions
- Loading skeletons
- Toast notifications

### Color Scheme
- Primary: #FF6B35 (Orange)
- Secondary: #004E89 (Dark Blue)
- Success: #06A77D (Green)
- Warning: #F77F00 (Gold)
- Danger: #D62828 (Red)
- Light: #F7F7F7
- Dark: #1a1a1a

### Key Components
- MapView - Leaflet map component
- VendorCard - Vendor list item
- VendorMarker - Map marker popup
- OrderCard - Order list item
- LoadingSkeleton - Skeleton loading
- Toast - Notification system

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET in .env
- [ ] Configure DATABASE_URL untuk production DB
- [ ] Set CORS_ORIGIN ke domain production
- [ ] Enable HTTPS
- [ ] Setup CDN untuk static files
- [ ] Configure email service untuk notifications
- [ ] Setup monitoring & logging
- [ ] Database backup strategy

### Environment Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<strong-random-key>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS=https://yourdomain.com
PORT=5000
```

## 📝 Notes

### Known Limitations
- Location tracking hanya via GPS (di-weight oleh akurasi device)
- Marker movement di-update setiap update location dari vendor
- Distance calculation berbasis Haversine (flat earth approximation)
- Heatmap di-generate per request (bisa di-cache)

### Future Improvements
- [ ] Redis caching untuk vendor list
- [ ] Microservices architecture
- [ ] Kubernetes deployment configs
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Machine learning model untuk location prediction
- [ ] Push notifications untuk buyers
- [ ] In-app chat untuk buyer-vendor
- [ ] Payment gateway integration
- [ ] Progressive Web App (PWA)
- [ ] Offline mode dengan service workers

## 📞 Support

Untuk pertanyaan atau issue, silahkan buat issue di GitHub atau hubungi team developer.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Author**: JejakJajan Team
