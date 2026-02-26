import io from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  socket = io('http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => socket;

export const emitVendorLocation = (latitude, longitude) => {
  if (socket) {
    socket.emit('vendor:location', { latitude, longitude });
  }
};

export const emitBuyerJoinMap = () => {
  if (socket) {
    socket.emit('buyer:join-map', {});
  }
};

export const emitGetNearbyVendors = (latitude, longitude, radiusMeters = 500) => {
  if (socket) {
    socket.emit('buyer:get-nearby', { latitude, longitude, radiusMeters });
  }
};

export const emitFollowVendor = (vendorId) => {
  if (socket) {
    socket.emit('buyer:follow-vendor', { vendorId });
  }
};

export const emitUnfollowVendor = (vendorId) => {
  if (socket) {
    socket.emit('buyer:unfollow-vendor', { vendorId });
  }
};

export const emitOrderStatusUpdate = (orderId, status) => {
  if (socket) {
    socket.emit('order:status-update', { orderId, status });
  }
};

export const onVendorLocationUpdate = (callback) => {
  if (socket) {
    socket.on('vendor:location-update', callback);
  }
};

export const onVendorActiveVendors = (callback) => {
  if (socket) {
    socket.on('vendor:active-vendors', callback);
  }
};

export const onVendorNearby = (callback) => {
  if (socket) {
    socket.on('vendor:nearby', callback);
  }
};

export const onVendorFollowing = (callback) => {
  if (socket) {
    socket.on('vendor:following', callback);
  }
};

export const onOrderStatusChanged = (callback) => {
  if (socket) {
    socket.on('order:status-changed', callback);
  }
};

export const onLocationSaved = (callback) => {
  if (socket) {
    socket.on('location:saved', callback);
  }
};

export const onSocketError = (callback) => {
  if (socket) {
    socket.on('error', callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
