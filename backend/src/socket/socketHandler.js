import { verifyToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const activeVendors = new Map(); // Store active vendor locations

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Vendor location tracking
    socket.on('vendor:location', async (data) => {
      try {
        const { token, latitude, longitude } = data;
        const decoded = verifyToken(token);

        if (!decoded) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const vendor = await prisma.vendor.findUnique({
          where: { userId: decoded.userId },
        });

        if (!vendor) {
          socket.emit('error', { message: 'Vendor not found' });
          return;
        }

        // Store active vendor location
        activeVendors.set(vendor.id, {
          vendorId: vendor.id,
          userId: vendor.userId,
          latitude,
          longitude,
          timestamp: Date.now(),
          storeName: vendor.storeName,
          status: vendor.status,
        });

        // Update vendor location in database
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            latitude,
            longitude,
            lastLocationTime: new Date(),
          },
        });

        // Broadcast updated location to all connected buyers
        io.emit('vendor:location-update', {
          vendorId: vendor.id,
          latitude,
          longitude,
          storeName: vendor.storeName,
          status: vendor.status,
          timestamp: Date.now(),
        });

        socket.emit('location:saved', { success: true });
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Error updating location' });
      }
    });

    // Join buyer room
    socket.on('buyer:join-map', (data) => {
      const { token } = data;
      const decoded = verifyToken(token);

      if (!decoded) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      socket.join(`buyer:${decoded.userId}`);
      
      // Send current active vendors
      const vendorsArray = Array.from(activeVendors.values());
      socket.emit('vendor:active-vendors', vendorsArray);
    });

    // Buyer requesting nearby vendors
    socket.on('buyer:get-nearby', async (data) => {
      try {
        const { token, latitude, longitude, radiusMeters = 500 } = data;
        const decoded = verifyToken(token);

        if (!decoded) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const vendors = await prisma.vendor.findMany({
          where: { status: 'ACTIVE', isSuspended: false },
          include: { menus: true },
        });

        // Filter by distance (Haversine)
        const nearbyVendors = vendors.filter(vendor => {
          const distance = calculateDistance(latitude, longitude, vendor.latitude, vendor.longitude);
          return distance <= radiusMeters;
        });

        socket.emit('vendor:nearby', {
          vendors: nearbyVendors,
          count: nearbyVendors.length,
          radiusMeters,
        });
      } catch (error) {
        console.error('Error getting nearby vendors:', error);
        socket.emit('error', { message: 'Error getting nearby vendors' });
      }
    });

    // Follow vendor
    socket.on('buyer:follow-vendor', async (data) => {
      try {
        const { token, vendorId } = data;
        const decoded = verifyToken(token);

        if (!decoded) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Subscribe to vendor location updates
        socket.join(`vendor:${vendorId}`);
        socket.emit('vendor:following', { vendorId, success: true });
      } catch (error) {
        console.error('Error following vendor:', error);
        socket.emit('error', { message: 'Error following vendor' });
      }
    });

    // Unfollow vendor
    socket.on('buyer:unfollow-vendor', (data) => {
      const { vendorId } = data;
      socket.leave(`vendor:${vendorId}`);
    });

    // Order status update
    socket.on('order:status-update', async (data) => {
      try {
        const { token, orderId, status } = data;
        const decoded = verifyToken(token);

        if (!decoded) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Broadcast to buyer
        io.to(`buyer:${order.buyerId}`).emit('order:status-changed', {
          orderId,
          status,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        socket.emit('error', { message: 'Error updating order status' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove vendor from active list if disconnected
      for (const [vendorId, vendor] of activeVendors.entries()) {
        if (vendor.userId) {
          activeVendors.delete(vendorId);
        }
      }
    });
  });
};

// Helper function for distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
