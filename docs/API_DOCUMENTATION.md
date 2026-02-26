# JejakJajan API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Semua protected endpoints memerlukan Bearer token di header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "BUYER" // atau "VENDOR"
}
```

**Response Success (201)**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "BUYER"
  }
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response Success (200)**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "BUYER"
  }
}
```

### 3. Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response Success (200)**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "BUYER",
    "avatar": "avatar_url",
    "followers": [...]
  }
}
```

### 4. Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "08123456789",
  "avatar": "new_avatar_url"
}
```

---

## Vendor Endpoints

### 1. Create Vendor Profile
```http
POST /vendors
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeName": "Soto Ayam Warisan",
  "description": "Soto ayam tradisional",
  "category": "Makanan"
}
```

**Response Success (201)**
```json
{
  "message": "Vendor created successfully",
  "vendor": {
    "id": "vendor_123",
    "userId": "user_123",
    "storeName": "Soto Ayam Warisan",
    "status": "INACTIVE",
    "rating": 0,
    "followerCount": 0
  }
}
```

### 2. Get Vendor Profile
```http
GET /vendors/profile/:vendorId
```

**Response Success (200)**
```json
{
  "vendor": {
    "id": "vendor_123",
    "storeName": "Soto Ayam Warisan",
    "description": "Soto ayam tradisional",
    "category": "Makanan",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "status": "ACTIVE",
    "rating": 4.5,
    "totalReviews": 42,
    "menus": [...],
    "reviews": [...],
    "user": {
      "name": "Pak Sutrisno",
      "phone": "08123456789"
    }
  }
}
```

### 3. Update Vendor Status
```http
PUT /vendors/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE" // ACTIVE | INACTIVE | RESTING
}
```

### 4. Update Location
```http
PUT /vendors/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

**Response Success (200)**
```json
{
  "message": "Location updated",
  "vendor": {
    "id": "vendor_123",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "lastLocationTime": "2026-02-26T10:30:00Z"
  }
}
```

### 5. Get Active Vendors
```http
GET /vendors/active
```

**Response Success (200)**
```json
{
  "vendors": [
    {
      "id": "vendor_123",
      "storeName": "Soto Ayam Warisan",
      "category": "Makanan",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "status": "ACTIVE",
      "rating": 4.5,
      "menus": [...]
    }
  ],
  "count": 25
}
```

### 6. Get Vendors by Category
```http
GET /vendors/category/:category
```

**Example**: `/vendors/category/Makanan`

---

## Menu Endpoints

### 1. Create Menu
```http
POST /menus
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Soto Ayam Biasa",
  "description": "Soto dengan porsi standar",
  "price": 12000,
  "image": <binary-file>
}
```

### 2. Update Menu
```http
PUT /menus/:menuId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Soto Ayam Premium",
  "price": 15000,
  "isAvailable": true
}
```

### 3. Delete Menu
```http
DELETE /menus/:menuId
Authorization: Bearer <token>
```

### 4. Get Vendor Menus
```http
GET /menus/vendor/:vendorId
```

---

## Order Endpoints

### 1. Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendorId": "vendor_123",
  "items": [
    {
      "menuId": "menu_1",
      "quantity": 2,
      "price": 12000
    }
  ],
  "totalPrice": 24000,
  "notes": "Pedes sedang, no onion"
}
```

**Response Success (201)**
```json
{
  "message": "Order created",
  "order": {
    "id": "order_123",
    "buyerId": "user_123",
    "vendorId": "vendor_123",
    "totalPrice": 24000,
    "status": "PENDING",
    "items": [...]
  }
}
```

### 2. Get Order Details
```http
GET /orders/:orderId
Authorization: Bearer <token>
```

### 3. Update Order Status
```http
PUT /orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED" // PENDING | CONFIRMED | COMPLETED | CANCELLED
}
```

### 4. Get Buyer Orders
```http
GET /orders/buyer/list
Authorization: Bearer <token>
```

### 5. Get Vendor Orders
```http
GET /orders/vendor/list
Authorization: Bearer <token>
```

---

## Review Endpoints

### 1. Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendorId": "vendor_123",
  "orderId": "order_123",
  "rating": 5,
  "comment": "Enak banget, pelayanan cepat!"
}
```

**Response Success (201)**
```json
{
  "message": "Review created",
  "review": {
    "id": "review_123",
    "buyerId": "user_123",
    "vendorId": "vendor_123",
    "orderId": "order_123",
    "rating": 5,
    "comment": "Enak banget, pelayanan cepat!"
  }
}
```

### 2. Get Vendor Reviews
```http
GET /reviews/vendor/:vendorId
```

### 3. Update Review
```http
PUT /reviews/:reviewId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated comment"
}
```

### 4. Delete Review
```http
DELETE /reviews/:reviewId
Authorization: Bearer <token>
```

---

## Admin Endpoints

### 1. Get Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

**Response Success (200)**
```json
{
  "stats": {
    "totalUsers": 1250,
    "totalVendors": 185,
    "totalOrders": 8500,
    "totalRevenue": 85000000
  },
  "recentOrders": [...],
  "topVendors": [...]
}
```

### 2. Get Analytics
```http
GET /admin/analytics?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```

### 3. Get Heatmap
```http
GET /admin/heatmap
Authorization: Bearer <token>
```

**Response Success (200)**
```json
{
  "heatmapData": [
    {
      "lat": -6.20,
      "lon": 106.84,
      "count": 15,
      "revenue": 180000,
      "intensity": 0.75
    }
  ]
}
```

### 4. Get All Users
```http
GET /admin/users?page=1&limit=20&role=BUYER
Authorization: Bearer <token>
```

### 5. Verify Vendor
```http
PUT /admin/vendors/:vendorId/verify
Authorization: Bearer <token>
```

### 6. Suspend Vendor
```http
PUT /admin/vendors/:vendorId/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violasi syarat dan ketentuan"
}
```

### 7. Unsuspend Vendor
```http
PUT /admin/vendors/:vendorId/unsuspend
Authorization: Bearer <token>
```

### 8. Suspend User
```http
PUT /admin/users/:userId/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Perilaku tidak sesuai"
}
```

### 9. Unsuspend User
```http
PUT /admin/users/:userId/unsuspend
Authorization: Bearer <token>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided" / "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already exists" / "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting
- Per user: 100 requests per 15 minutes
- Per IP: 1000 requests per 15 minutes

## CORS
- Allowed origins: http://localhost:5173, http://localhost:3000
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization

## WebSocket Events
See main README.md for WebSocket documentation

---

**Last Updated**: February 2026
