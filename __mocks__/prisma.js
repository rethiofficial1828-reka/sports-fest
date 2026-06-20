const { PrismaClient } = require("@prisma/client");
const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  event: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  registration: { findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
  waitlist: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
  notification: { findMany: jest.fn(), create: jest.fn() },
  report: { findMany: jest.fn(), create: jest.fn() },
  auditLog: { findMany: jest.fn(), create: jest.fn() },
  college: { findMany: jest.fn(), upsert: jest.fn() },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

jest.mock("./lib/prisma", () => ({
  prisma: mockPrisma,
}));
