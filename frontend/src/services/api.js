import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
// when there is no explicit token stored we can fallback to a demo token
// this makes the app 'auto‑logged in' for quick testing; remove in production.
const DEMO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW0zbjVoYXYwMDAwc2t6M2E2Y2YwemFzIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyMTIyODcwLCJleHAiOjE3NzI3Mjc2NzB9.XI2Fmb9buS89rb9-VBaJWxdwpglMUlWl';

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || DEMO_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Vendor Services
export const vendorService = {
  create: (data) => api.post('/vendors', data),
  getProfile: (vendorId) => api.get(`/vendors/profile/${vendorId}`),
  updateStatus: (status) => api.put('/vendors/status', { status }),
  updateLocation: (latitude, longitude) =>
    api.put('/vendors/location', { latitude, longitude }),
  getActive: () => api.get('/vendors/active'),
  getByCategory: (category) => api.get(`/vendors/category/${category}`),
};

// Menu Services
export const menuService = {
  create: (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price);
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable);
    if (data.imageFile) formData.append('image', data.imageFile);
    return api.post('/menus', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (menuId, data) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable);
    if (data.imageFile) formData.append('image', data.imageFile);
    return api.put(`/menus/${menuId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (menuId) => api.delete(`/menus/${menuId}`),
  getVendorMenus: (vendorId) => api.get(`/menus/vendor/${vendorId}`),
};

// Order Services
export const orderService = {
  create: (data) => api.post('/orders', data),
  get: (orderId) => api.get(`/orders/${orderId}`),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  getBuyerOrders: () => api.get('/orders/buyer/list'),
  getVendorOrders: () => api.get('/orders/vendor/list'),
};

// Review Services
export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getVendorReviews: (vendorId) => api.get(`/reviews/vendor/${vendorId}`),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (startDate, endDate) =>
    api.get('/admin/analytics', { params: { startDate, endDate } }),
  getHeatmap: () => api.get('/admin/heatmap'),
  getUsers: (page = 1, limit = 20) =>
    api.get('/admin/users', { params: { page, limit } }),
  verifyVendor: (vendorId) => api.put(`/admin/vendors/${vendorId}/verify`),
  suspendVendor: (vendorId, reason) =>
    api.put(`/admin/vendors/${vendorId}/suspend`, { reason }),
  unsuspendVendor: (vendorId) => api.put(`/admin/vendors/${vendorId}/unsuspend`),
  suspendUser: (userId, reason) =>
    api.put(`/admin/users/${userId}/suspend`, { reason }),
  unsuspendUser: (userId) => api.put(`/admin/users/${userId}/unsuspend`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

export default api;
