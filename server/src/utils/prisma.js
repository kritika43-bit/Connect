// Shared Prisma client singleton
// This ensures only one PrismaClient instance is created,
// and it is created after env variables have been loaded.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
