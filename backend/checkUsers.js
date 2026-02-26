import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('users:', users);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
