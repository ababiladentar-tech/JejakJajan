import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const { vendorId, items, totalPrice, notes } = req.body;
    const buyerId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }

    const order = await prisma.order.create({
      data: {
        buyerId,
        vendorId,
        totalPrice: parseFloat(totalPrice),
        notes,
        items: {
          create: items.map(item => ({
            menuId: item.menuId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Update vendor stats
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        totalSales: vendor.totalSales + 1,
      },
    });

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menu: true } },
        vendor: true,
        buyer: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: order.vendorId },
    });

    if (vendor.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
        vendor: true,
        items: { include: { menu: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const orders = await prisma.order.findMany({
      where: { vendorId: vendor.id },
      include: {
        buyer: true,
        items: { include: { menu: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
