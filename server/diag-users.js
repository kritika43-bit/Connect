const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database!');
    
    console.log('Fetching users with profiles...');
    const users = await prisma.user.findMany({
      include: { profile: true },
      where: {
        profile: { isPublic: true }
      }
    });
    console.log(`Found ${users.length} public users.`);
    
  } catch (error) {
    console.error('Operation failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
