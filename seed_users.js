const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const adminPasswordHash = await bcrypt.hash('OfficialAdmin@in01', 10);
  await prisma.user.upsert({
    where: { email: 'rethish2828@gmail.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'admin'
    },
    create: {
      email: 'rethish2828@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      firstName: 'Official',
      lastName: 'Admin',
      fullName: 'Official Admin',
      isEmailVerified: true
    }
  });

  await prisma.user.upsert({
    where: { email: 'student@sportsfest.in' },
    update: {},
    create: {
      email: 'student@sportsfest.in',
      passwordHash,
      role: 'student',
      firstName: 'Student',
      lastName: 'Test',
      fullName: 'Student Test',
      isEmailVerified: true
    }
  });

  await prisma.user.upsert({
    where: { email: 'organizer@sportsfest.in' },
    update: {},
    create: {
      email: 'organizer@sportsfest.in',
      passwordHash,
      role: 'organizer',
      firstName: 'Organizer',
      lastName: 'Test',
      fullName: 'Organizer Test',
      isEmailVerified: true
    }
  });

  console.log('Database seeded with standard users and mdgameingda@gmail.com! (password: password123)');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
