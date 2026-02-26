import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReview = async (req, res) => {
  try {
    const { vendorId, orderId, rating, comment } = req.body;
    const buyerId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if order exists and belongs to buyer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== buyerId) {
      return res.status(403).json({ message: 'Invalid order' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      return res.status(409).json({ message: 'Review already exists for this order' });
    }

    const review = await prisma.review.create({
      data: {
        buyerId,
        vendorId,
        orderId,
        rating,
        comment,
      },
    });

    // Update vendor rating
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { reviews: true },
    });

    const avgRating =
      vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length;

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        rating: avgRating,
        totalReviews: vendor.reviews.length,
      },
    });

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { vendorId },
      include: {
        buyer: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.buyerId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating }),
        ...(comment && { comment }),
      },
    });

    res.json({ message: 'Review updated', review: updatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.buyerId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};
