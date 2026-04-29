const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE DATABASE IF NOT EXISTS alumnidb;');
    console.log('Successfully created alumnidb');
  } catch (error) {
    console.error('Failed to create database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
