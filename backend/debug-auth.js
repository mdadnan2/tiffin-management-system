const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function debug() {
  console.log('🔍 Debugging Auth Service...\n');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
  console.log('   JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✓ Set' : '✗ Missing');
  
  // Check database connection
  console.log('\n2. Database Connection:');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('   ✓ Database connected');
    
    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`   ✓ Found ${userCount} users in database`);
    
    // Try to find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@tiffin.com' }
    });
    console.log('   Demo user:', demoUser ? '✓ Exists' : '✗ Not found');
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('   ✗ Database error:', error.message);
  }
  
  console.log('\n3. Recommendations:');
  console.log('   - Ensure PostgreSQL is running: npm run start:db');
  console.log('   - Run migrations: npm run migrate');
  console.log('   - Seed database: npm run seed');
  console.log('   - Generate Prisma client: npm run prisma:generate');
}

debug();
