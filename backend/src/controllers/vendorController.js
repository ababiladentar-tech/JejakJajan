import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createVendor = async (req, res) => {
  try {
    const { storeName, description, category } = req.body;
    const userId = req.user.userId;

    // Check if vendor already exists for this user
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (existingVendor) {
      return res.status(409).json({ message: 'Vendor account already exists' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId,
        storeName,
        description,
        category,
      },
    });

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating vendor' });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        menus: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching vendor profile' });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.userId;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'RESTING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { status },
    });

    res.json({
      message: 'Vendor status updated',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating vendor status' });
  }
};

export const updateVendorLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Save location to history
    await prisma.locationHistory.create({
      data: {
        vendorId: vendor.id,
        latitude,
        longitude,
      },
    });

    // Update vendor location
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        latitude,
        longitude,
        lastLocationTime: new Date(),
      },
    });

    res.json({
      message: 'Location updated',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating location' });
  }
};

export const getActiveVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'ACTIVE',
        isSuspended: false,
      },
      include: {
        menus: true,
        user: { select: { name: true, phone: true } },
        reviews: { take: 5 },
      },
    });

    res.json({ vendors, count: vendors.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

export const getVendorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const vendors = await prisma.vendor.findMany({
      where: {
        category: { contains: category, mode: 'insensitive' },
        status: 'ACTIVE',
        isSuspended: false,
      },
      include: {
        menus: true,
        user: { select: { name: true } },
      },
    });

    res.json({ vendors, count: vendors.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};
