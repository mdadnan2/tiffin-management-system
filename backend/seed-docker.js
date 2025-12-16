const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const users = [
    { email: 'demo@tiffin.com', name: 'Demo User', password: 'demo123', role: 'USER' },
    { email: 'admin@tiffin.com', name: 'Admin User', password: 'demo123', role: 'ADMIN' },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      console.log(`✓ User ${userData.email} already exists`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        role: userData.role,
      },
    });

    await prisma.priceSetting.create({
      data: {
        userId: user.id,
        breakfast: 50,
        lunch: 80,
        dinner: 70,
        custom: 100,
      },
    });

    console.log(`✓ Created user: ${userData.email}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
