import { POST as createEventHandler } from "@/app/api/events/route";

// Stateful mock data for prisma
const mockDb: any = { events: [], users: [] };

jest.mock("@/lib/prisma", () => {
  const mock: any = {
    user: {
      findUnique: jest.fn().mockImplementation(async (args: any) => {
        return mockDb.users.find((u: any) => u.id === args?.where?.id || u.email === args?.where?.email) || null;
      }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(async (args: any) => {
        const u = { id: args.data.id || "u-new", ...args.data };
        mockDb.users.push(u);
        return u;
      }),
      update: jest.fn().mockImplementation(async (args: any) => ({ ...args.data })),
    },
    event: {
      findMany: jest.fn().mockImplementation(async () => mockDb.events),
      findUnique: jest.fn().mockImplementation(async (args: any) => {
        return mockDb.events.find((e: any) => e.id === args?.where?.id || e.slug === args?.where?.slug) || null;
      }),
      create: jest.fn().mockImplementation(async (args: any) => {
        const e = { id: args.data.id || "evt-new", ...args.data };
        mockDb.events.push(e);
        return e;
      }),
      update: jest.fn().mockImplementation(async (args: any) => {
        const idx = mockDb.events.findIndex((e: any) => e.id === args.where.id);
        if (idx >= 0) {
          mockDb.events[idx] = { ...mockDb.events[idx], ...args.data };
          return mockDb.events[idx];
        }
        return { ...args.data };
      }),
    },
    college: {
      upsert: jest.fn().mockImplementation(async (args: any) => ({ id: "col-1", ...args.create })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    registration: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    waitlist: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({}) },
    notification: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn(async (cb: any) => await cb(mock)),
  };
  return { prisma: mock };
});

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}));

describe("Event Management Date Validations", () => {
  const adminCookie = "mock_access_token=" + Buffer.from(JSON.stringify({
    id: "u-admin", email: "admin@sportsfest.in", role: "admin",
    exp: Math.floor(Date.now() / 1000) + 600
  })).toString("base64");

  beforeEach(() => {
    mockDb.events = [];
    mockDb.users = [{ id: "u-admin", email: "admin@sportsfest.in", role: "admin", fullName: "Admin" }];
  });

  test("Event creation rejects past dates", async () => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const request = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "cookie": adminCookie },
      body: JSON.stringify({
        title: "Cricket Fest",
        eventDate: pastDate,
        registrationDeadline: futureDate,
        sportSlug: "cricket",
      }),
    });

    const res = await createEventHandler(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Event start date cannot be in the past");
  });

  test("Event creation rejects deadline on/after start date", async () => {
    const today = new Date();
    const eventDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const regDeadline = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();

    const request = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "cookie": adminCookie },
      body: JSON.stringify({
        title: "Cricket Fest",
        eventDate: eventDate,
        registrationDeadline: regDeadline,
        sportSlug: "cricket",
      }),
    });

    const res = await createEventHandler(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Registration deadline must be at least one day before the event start date");
  });

  test("Event creation succeeds with valid future dates", async () => {
    const today = new Date();
    const regDeadline = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const eventDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const request = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "cookie": adminCookie },
      body: JSON.stringify({
        title: "IITM Sportfest 2026",
        eventDate: eventDate,
        registrationDeadline: regDeadline,
        sportSlug: "cricket",
      }),
    });

    const res = await createEventHandler(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("IITM Sportfest 2026");
  });
});
