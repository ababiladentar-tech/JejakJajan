import { create } from 'zustand';

// keep a fallback token for rapid testing (replace with your own string)
const DEMO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW0zbjVoYXYwMDAwc2t6M2E2Y2YwemFzIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyMTIyODcwLCJleHAiOjE3NzI3Mjc2NzB9.XI2Fmb9buS89rb9-VBaJWxdwpglMUlWl';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || DEMO_TOKEN,
  isAuthenticated: !!(localStorage.getItem('token') || DEMO_TOKEN),
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const useVendorStore = create((set) => {
  // load favorites from localStorage
  const stored = localStorage.getItem('favorites');
  const initialFavorites = stored ? JSON.parse(stored) : [];

  return {
    vendors: [],
    activeVendors: [],
    selectedVendor: null,
    favorites: initialFavorites,

    setVendors: (vendors) => set({ vendors }),
    setActiveVendors: (activeVendors) => set({ activeVendors }),
    setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),

    updateVendorLocation: (vendorId, latitude, longitude) =>
      set((state) => ({
        activeVendors: state.activeVendors.map((v) =>
          (v.id === vendorId || v.vendorId === vendorId) ? { ...v, latitude, longitude } : v
        ),
      })),

    addFavorite: (vendorId) =>
      set((state) => {
        const fav = [...state.favorites, vendorId];
        localStorage.setItem('favorites', JSON.stringify(fav));
        return { favorites: fav };
      }),
    removeFavorite: (vendorId) =>
      set((state) => {
        const fav = state.favorites.filter((id) => id !== vendorId);
        localStorage.setItem('favorites', JSON.stringify(fav));
        return { favorites: fav };
      }),
    toggleFavorite: (vendorId) =>
      set((state) => {
        const isFav = state.favorites.includes(vendorId);
        const fav = isFav
          ? state.favorites.filter((id) => id !== vendorId)
          : [...state.favorites, vendorId];
        localStorage.setItem('favorites', JSON.stringify(fav));
        return { favorites: fav };
      }),
  };
});

export const useOrderStore = create((set) => ({
  orders: [],
  selectedOrder: null,
  cart: [],
  
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.menuId === item.menuId);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.menuId === item.menuId ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  
  removeFromCart: (menuId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.menuId !== menuId),
    })),
  
  updateCartItem: (menuId, quantity) =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.menuId === menuId ? { ...i, quantity } : i
      ).filter((i) => i.quantity > 0),
    })),
  
  clearCart: () => set({ cart: [] }),
}));

export const useMapStore = create((set) => ({
  userLocation: null,
  mapCenter: [-6.2088, 106.8456], // Jakarta default
  zoom: 13,
  
  setUserLocation: (lat, lon) => set({ userLocation: { lat, lon } }),
  setMapCenter: (lat, lon) => set({ mapCenter: [lat, lon] }),
  setZoom: (zoom) => set({ zoom }),
}));

export const useNotificationStore = create((set) => ({
  notifications: [],
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: Date.now(), ...notification }],
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
