require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'EMPTY ✗');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$connect()
  .then(() => { console.log('SUCCESS: DB connected!'); return p.$disconnect(); })
  .catch(e => { console.error('FAIL:', e.message); return p.$disconnect(); })
  .finally(() => process.exit(0));
