import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as createEventHandler, GET as getEventsHandler } from "@/app/api/events/route";
import { PUT as updateVerificationHandler } from "@/app/api/admin/verifications/route";

// Stateful mock data
const mockDb: any = { users: [], events: [], colleges: [], verifications: [] };

jest.mock("@/lib/prisma", () => {
  const mock: any = {
    user: {
      findUnique: jest.fn().mockImplementation(async (args: any) => {
        return mockDb.users.find((u: any) => u.email === args?.where?.email || u.id === args?.where?.id) || null;
      }),
      create: jest.fn().mockImplementation(async (args: any) => {
        const u = { id: args.data.id || "u-" + Date.now(), ...args.data };
        mockDb.users.push(u);
        return u;
      }),
    },
    event: {
      findMany: jest.fn().mockImplementation(async () => mockDb.events),
      create: jest.fn().mockImplementation(async (args: any) => {
        const e = { id: args.data.id || "evt-" + Date.now(), ...args.data, college: { id: "col-1", name: "Stanford University", isVerified: true } };
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
      upsert: jest.fn().mockImplementation(async (args: any) => {
        let col = mockDb.colleges.find((c: any) => c.name === args.where.name);
        if (!col) {
          col = { id: "col-" + Date.now(), ...args.create };
          mockDb.colleges.push(col);
        } else {
          col = { ...col, ...args.update };
          const idx = mockDb.colleges.findIndex((c: any) => c.name === args.where.name);
          mockDb.colleges[idx] = col;
        }
        return col;
      }),
      findMany: jest.fn().mockImplementation(async () => mockDb.colleges),
    },
    verification: {
      findMany: jest.fn().mockImplementation(async () => mockDb.verifications),
      create: jest.fn().mockImplementation(async (args: any) => {
        const v = { id: "ver-" + Date.now(), ...args.data };
        mockDb.verifications.push(v);
        return v;
      }),
      delete: jest.fn().mockImplementation(async (args: any) => {
        const idx = mockDb.verifications.findIndex((v: any) => v.id === args.where.id);
        if (idx >= 0) {
          const deleted = mockDb.verifications[idx];
          mockDb.verifications.splice(idx, 1);
          return deleted;
        }
        return null;
      }),
    },
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

describe("Collegiate Event Portal E2E Simulator Workflows", () => {
  beforeEach(() => {
    mockDb.users = [];
    mockDb.events = [];
    mockDb.colleges = [{ id: "col-1", name: "Stanford University", isVerified: false }];
    mockDb.verifications = [{ id: "ver-1", collegeName: "Stanford University", requester: "Sarah Connor" }];
  });

  test("E2E Organizer Workflow: Register, login, create event, approve event", async () => {
    // 1. Organizer Registration
    const regReq = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Sarah",
        lastName: "Connor",
        role: "organizer",
        institution: "Stanford University",
        email: "sarah@stanford.edu.in",
        password: "OrganizerPass123!",
        contactNumber: "9876543210"
      }),
    });
    
    const regRes = await registerHandler(regReq);
    expect(regRes.status).toBe(200);
    const regBody = await regRes.json();
    expect(regBody.user.role).toBe("organizer");

    // Simulate email verification
    const u = mockDb.users.find((user: any) => user.email === "sarah@stanford.edu.in");
    if (u) {
      u.isEmailVerified = true;
    }

    // 2. Organizer Login
    const loginReq = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "sarah@stanford.edu.in",
        password: "OrganizerPass123!",
      }),
    });
    
    const loginRes = await loginHandler(loginReq);
    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json();
    const mockUser = loginBody.user;
    
    // Construct mock access cookie token for organizer requests
    const organizerCookie = "mock_access_token=" + Buffer.from(JSON.stringify({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      institution: mockUser.institution,
      exp: Math.floor(Date.now() / 1000) + 600
    })).toString("base64");

    // 3. Organizer Creates a Tournament
    const today = new Date();
    const regDeadline = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const eventDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();

    const createReq = new Request("http://localhost/api/events", {
      method: "POST",
      headers: {
        "cookie": organizerCookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Stanford Tennis Open 2026",
        eventDate,
        registrationDeadline: regDeadline,
        sport: { name: "Tennis", icon: "🎾", color: "#1ABC9C" },
        fee: 250,
        level: "state"
      }),
    });

    const createRes = await createEventHandler(createReq);
    expect(createRes.status).toBe(200);
    const createBody = await createRes.json();
    expect(createBody.title).toBe("Stanford Tennis Open 2026");

    // 4. Admin Approves College Verification request
    const adminCookie = "mock_access_token=" + Buffer.from(JSON.stringify({
      id: "u-admin",
      email: "admin@sportsfest.in",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 600
    })).toString("base64");

    const verificationId = mockDb.verifications[0]?.id;
    expect(verificationId).toBeDefined();

    const verifyReq = new Request("http://localhost/api/admin/verifications", {
      method: "PUT",
      headers: {
        "cookie": adminCookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: verificationId,
        collegeName: "Stanford University",
        action: "approve"
      })
    });

    const verifyRes = await updateVerificationHandler(verifyReq);
    expect(verifyRes.status).toBe(200);

    const collegeRecord = mockDb.colleges.find((c: any) => c.name === "Stanford University");
    expect(collegeRecord.isVerified).toBe(true);

    // 5. Query Events publicly and check if it is active
    const queryReq = new Request("http://localhost/api/events", { method: "GET" });
    const queryRes = await getEventsHandler(queryReq);
    expect(queryRes.status).toBe(200);
    const queryBody = await queryRes.json();
    expect(queryBody.some((e: any) => e.title === "Stanford Tennis Open 2026")).toBe(true);
  });
});
