import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalVendors = await prisma.vendor.count();
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { buyer: true, vendor: true },
    });

    const vendorStats = await prisma.vendor.findMany({
      select: {
        id: true,
        storeName: true,
        rating: true,
        totalSales: true,
        followerCount: true,
      },
      orderBy: { totalSales: 'desc' },
      take: 10,
    });

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
      },
      recentOrders,
      topVendors: vendorStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const skip = (page - 1) * limit;

    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: { vendor: true },
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { isVerified: true },
    });

    res.json({ message: 'Vendor verified', vendor: updatedVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying vendor' });
  }
};

export const suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isSuspended: true,
        suspendReason: reason,
        status: 'INACTIVE',
      },
    });

    res.json({ message: 'Vendor suspended', vendor: updatedVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error suspending vendor' });
  }
};

export const unsuspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isSuspended: false,
        suspendReason: null,
      },
    });

    res.json({ message: 'Vendor unsuspended', vendor: updatedVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unsuspending vendor' });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    // Get all active vendors with their locations
    const vendors = await prisma.vendor.findMany({
      where: { status: 'ACTIVE', isSuspended: false },
      select: { id: true, latitude: true, longitude: true, totalSales: true },
    });

    // Create grid-based heatmap data
    const gridSize = 0.01; // ~1km grid
    const heatmapGrid = {};

    vendors.forEach(vendor => {
      const lat = Math.floor(vendor.latitude / gridSize) * gridSize;
      const lon = Math.floor(vendor.longitude / gridSize) * gridSize;
      const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;

      if (!heatmapGrid[key]) {
        heatmapGrid[key] = { lat, lon, count: 0, revenue: 0 };
      }

      heatmapGrid[key].count += 1;
      heatmapGrid[key].revenue += vendor.totalSales;
    });

    const heatmapData = Object.values(heatmapGrid);

    res.json({ heatmapData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating heatmap' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const totalOrders = await prisma.order.count({ where });
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where,
    });

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    const topVendors = await prisma.vendor.findMany({
      select: {
        id: true,
        storeName: true,
        totalSales: true,
        rating: true,
      },
      orderBy: { totalSales: 'desc' },
      take: 10,
    });

    res.json({
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        ordersByStatus,
        topVendors,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    res.json({ message: 'User suspended', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error suspending user' });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    res.json({ message: 'User unsuspended', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unsuspending user' });
  }
};
