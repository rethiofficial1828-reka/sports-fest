const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'mdgameingda@gmail.com' },
    update: {},
    create: {
      email: 'mdgameingda@gmail.com',
      passwordHash,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
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
