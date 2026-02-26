import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
        avatar: 'https://via.placeholder.com/200?text=Admin',
        isActive: true,
      },
    });
    console.log('✅ Admin created:', admin.email);

    // Create vendor users
    const vendor1 = await prisma.user.upsert({
      where: { email: 'vendor1@example.com' },
      update: {},
      create: {
        name: 'Pak Sutrisno',
        email: 'vendor1@example.com',
        password: await hashPassword('vendor123'),
        phone: '08123456789',
        role: 'VENDOR',
        isActive: true,
      },
    });

    const vendor2 = await prisma.user.upsert({
      where: { email: 'vendor2@example.com' },
      update: {},
      create: {
        name: 'Ibu Siti',
        email: 'vendor2@example.com',
        password: await hashPassword('vendor123'),
        phone: '08987654321',
        role: 'VENDOR',
        isActive: true,
      },
    });

    console.log('✅ Vendors created:', vendor1.email, vendor2.email);

    // Create vendor profiles
    const shop1 = await prisma.vendor.upsert({
      where: { userId: vendor1.id },
      update: {},
      create: {
        userId: vendor1.id,
        storeName: 'Soto Ayam Warisan',
        description: 'Soto ayam tradisional dengan rempah pilihan',
        category: 'Makanan',
        latitude: -6.2088,
        longitude: 106.8456,
        status: 'ACTIVE',
        rating: 4.8,
        totalReviews: 45,
        isVerified: true,
        followerCount: 120,
        totalSales: 250,
      },
    });

    const shop2 = await prisma.vendor.upsert({
      where: { userId: vendor2.id },
      update: {},
      create: {
        userId: vendor2.id,
        storeName: 'Tahu Goreng Crispy',
        description: 'Tahu goreng dengan berbagai pilihan sambal',
        category: 'Makanan',
        latitude: -6.2150,
        longitude: 106.8500,
        status: 'ACTIVE',
        rating: 4.6,
        totalReviews: 32,
        isVerified: true,
        followerCount: 85,
        totalSales: 180,
      },
    });

    console.log('✅ Vendor profiles created:', shop1.storeName, shop2.storeName);

    // Create menus
    const menus = await Promise.all([
      prisma.menu.create({
        data: {
          vendorId: shop1.id,
          name: 'Soto Ayam Biasa',
          description: 'Soto ayam dengan porsi standar',
          price: 12000,
          isAvailable: true,
        },
      }),
      prisma.menu.create({
        data: {
          vendorId: shop1.id,
          name: 'Soto Ayam Premium',
          description: 'Soto ayam dengan daging lebih banyak',
          price: 18000,
          isAvailable: true,
        },
      }),
      prisma.menu.create({
        data: {
          vendorId: shop2.id,
          name: 'Tahu Goreng (5 pcs)',
          description: 'Tahu goreng golden dengan sambal kacang',
          price: 15000,
          isAvailable: true,
        },
      }),
    ]);

    console.log('✅ Menus created:', menus.length, 'items');

    // Create buyer user
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer@example.com' },
      update: {},
      create: {
        name: 'John Buyer',
        email: 'buyer@example.com',
        password: await hashPassword('buyer123'),
        phone: '08555666777',
        role: 'BUYER',
        isActive: true,
      },
    });

    console.log('✅ Buyer created:', buyer.email);

    // Create sample order
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        vendorId: shop1.id,
        totalPrice: 24000,
        status: 'COMPLETED',
        items: {
          create: [
            {
              menuId: menus[0].id,
              quantity: 2,
              price: 12000,
            },
          ],
        },
      },
    });

    console.log('✅ Sample order created:', order.id);

    // Create sample review
    const review = await prisma.review.create({
      data: {
        buyerId: buyer.id,
        vendorId: shop1.id,
        orderId: order.id,
        rating: 5,
        comment: 'Makanannya enak banget, pelayanan cepat dan ramah!',
      },
    });

    console.log('✅ Sample review created:', review.id);

    // Create vendor stats
    await prisma.vendorStats.upsert({
      where: { vendorId: shop1.id },
      update: {},
      create: {
        vendorId: shop1.id,
        totalOrdersThisMonth: 45,
        totalRevenueThisMonth: 540000,
        averageDailyRevenue: 18000,
        peakHours: '{"11": 25, "12": 30, "17": 28, "18": 32}',
      },
    });

    await prisma.vendorStats.upsert({
      where: { vendorId: shop2.id },
      update: {},
      create: {
        vendorId: shop2.id,
        totalOrdersThisMonth: 32,
        totalRevenueThisMonth: 480000,
        averageDailyRevenue: 16000,
        peakHours: '{"11": 20, "12": 25, "17": 22, "18": 28}',
      },
    });

    console.log('✅ Vendor stats created');

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
