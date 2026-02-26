import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMenu = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const userId = req.user.userId;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const menu = await prisma.menu.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price: parseFloat(price),
        image: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    res.status(201).json({ message: 'Menu created', menu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating menu' });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { name, description, price, isAvailable } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { vendor: true },
    });

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    if (menu.vendor.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(req.file && { image: `/uploads/${req.file.filename}` }),
      },
    });

    res.json({ message: 'Menu updated', menu: updatedMenu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating menu' });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { vendor: true },
    });

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    if (menu.vendor.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.menu.delete({
      where: { id: menuId },
    });

    res.json({ message: 'Menu deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting menu' });
  }
};

export const getVendorMenus = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const menus = await prisma.menu.findMany({
      where: { vendorId },
    });

    res.json({ menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching menus' });
  }
};
