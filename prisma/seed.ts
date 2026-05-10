import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Owner & Staff
  const owner = await prisma.user.upsert({
    where: { email: 'owner@fatgym.com' },
    update: {},
    create: {
      email: 'owner@fatgym.com',
      name: 'Gym Owner',
      role: 'OWNER',
    },
  });

  // 2. Create Trainers
  await prisma.user.upsert({
    where: { email: 'mike@fatgym.com' },
    update: {},
    create: {
      email: 'mike@fatgym.com',
      name: 'Coach Mike',
      role: 'TRAINER',
      trainerProfile: {
        create: {
          trainerId: 'T-001',
          level: 'Senior',
          specialty: 'Weight Loss & Powerlifting',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'sarah@fatgym.com' },
    update: {},
    create: {
      email: 'sarah@fatgym.com',
      name: 'Coach Sarah',
      role: 'TRAINER',
      trainerProfile: {
        create: {
          trainerId: 'T-002',
          level: 'Expert',
          specialty: 'Yoga & Mobility',
        },
      },
    },
  });

  // 3. Create Packages
  await prisma.membershipPackage.create({
    data: {
      name: 'Gold Annual',
      price: 12000,
      durationDays: 365,
      description: 'Full gym access + 2 PT sessions/month',
    },
  });

  await prisma.pTPackage.create({
    data: {
      name: '12 PT Sessions',
      price: 8400,
      sessions: 12,
    },
  });

  // 4. Create Members
  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'MEMBER',
      memberProfile: {
        create: {
          memberId: 'M-2024-001',
          phone: '081-234-5678',
          status: 'ACTIVE',
        },
      },
    },
  });

  // 5. Create Inventory
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Water Bottle (500ml)', category: 'Drinks', quantity: 50, minStock: 20, sellingPrice: 15 },
      { name: 'Whey Protein (Chocolate)', category: 'Supplements', quantity: 5, minStock: 10, sellingPrice: 1200 },
      { name: 'Gym Towel', category: 'Rentals', quantity: 30, minStock: 10, sellingPrice: 50 },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
