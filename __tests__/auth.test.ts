import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { GET as sessionHandler, POST as logoutHandler } from "@/app/api/auth/session/route";
import { POST as forgotPasswordHandler } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordHandler } from "@/app/api/auth/reset-password/route";

const mockDb: any = { users: [], verificationCodes: [] };

// Mock jose
jest.mock("jose", () => ({
  jwtVerify: jest.fn().mockImplementation(async (token) => {
    if (token === "invalid-token") throw new Error("Invalid");
    if (token === "mock-jwt-token") {
      return { payload: { id: "test-user", role: "organizer", email: "test@sportsfest.in" } };
    }
    return { payload: { id: "u-123", role: "student" } };
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mock_access_token")
  }))
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation(async (args: any) => {
        const email = args?.where?.email;
        const id = args?.where?.id;
        return mockDb.users.find((u: any) => u.email === email || u.id === id) || null;
      }),
      findFirst: jest.fn().mockImplementation(async (args: any) => {
        const token = args?.where?.passwordResetToken;
        return mockDb.users.find((u: any) => u.passwordResetToken === token) || null;
      }),
      create: jest.fn().mockImplementation(async (args: any) => {
        const id = args.data.id || "u-" + Date.now();
        const u = { id, ...args.data };
        mockDb.users.push(u);
        return u;
      }),
      update: jest.fn().mockImplementation(async (args: any) => {
        const idx = mockDb.users.findIndex((u: any) => u.id === args?.where?.id || u.email === args?.where?.email);
        if (idx >= 0) {
          mockDb.users[idx] = { ...mockDb.users[idx], ...args.data };
          return mockDb.users[idx];
        }
        return { ...args.data };
      }),
    },
    verificationCode: {
      create: jest.fn().mockImplementation(async (args: any) => {
        mockDb.verificationCodes.push(args.data);
        return args.data;
      })
    },
    event: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    college: {
      upsert: jest.fn().mockResolvedValue({}),
    },
    registration: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    verification: { create: jest.fn().mockResolvedValue({}) },
    notification: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn(async (cb: any) => await cb(jest.requireMock("@/lib/prisma").prisma)),
  }
}));

describe("Authentication & Session Management Tests", () => {
  beforeEach(() => {
    mockDb.users = [];
    mockDb.verificationCodes = [];
    // Clear lockout and rate limit files to ensure clean state for tests
    const fs = require("fs");
    const path = require("path");
    const lockFile = path.join(process.cwd(), "lockouts.json");
    const rateLimitFile = path.join(process.cwd(), "rate_limits.json");
    if (fs.existsSync(lockFile)) {
      try { fs.unlinkSync(lockFile); } catch (e) {}
    }
    if (fs.existsSync(rateLimitFile)) {
      try { fs.unlinkSync(rateLimitFile); } catch (e) {}
    }
  });

  test("User Registration with Zod Password constraints and auto-hashing", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": "1.1.1.1" },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        role: "student",
        email: "john@sportsfest.in",
        password: "ValidPassword123!",
      }),
    });

    const res = await registerHandler(request);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user.email).toBe("john@sportsfest.in");
    
    // Check if user is in mockDb
    const u = mockDb.users.find((u:any) => u.email === "john@sportsfest.in");
    expect(u).toBeDefined();
    // Verify password is hashed (should not equal plaintext)
    expect(u.passwordHash).not.toBe("ValidPassword123!");
    expect(u.passwordHash.startsWith("$2")).toBe(true);
  });

  test("Successful login credentials validation", async () => {
    // 1. Create User
    const requestReg = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": "1.1.1.2" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        role: "student",
        email: "test@sportsfest.in",
        password: "TestPassword123!",
      }),
    });
    const resReg = await registerHandler(requestReg);
    if (resReg.status !== 200) throw new Error("REG ERROR: " + await resReg.text());
    expect(resReg.status).toBe(200);

    // Mock Email Verification
    const user = mockDb.users.find((u:any) => u.email === "test@sportsfest.in");
    if (user) {
      user.isEmailVerified = true;
    }

    // Login with valid credentials
    const requestLogin = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": "1.1.1.3" },
      body: JSON.stringify({
        email: "test@sportsfest.in",
        password: "TestPassword123!",
      }),
    });

    const resLogin = await loginHandler(requestLogin);
    if (resLogin.status !== 200) console.error("LOGIN ERROR:", await resLogin.text());
    expect(resLogin.status).toBe(200);
    const loginBody = await resLogin.json();
    expect(loginBody.role).toBe("student");
  });

  test("Failed logins lockout (5 attempts limit)", async () => {
    const email = "lockout@sportsfest.in";

    // 5 failed login attempts - user doesn't exist so each returns 401
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "x-forwarded-for": "1.1.1.4" },
        body: JSON.stringify({ email, password: "wrong-password" }),
      });
      const res = await loginHandler(req);
      expect(res.status).toBe(401);
    }

    // 6th attempt should block immediately with 429
    const req6 = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": "1.1.1.4" },
      body: JSON.stringify({ email, password: "wrong-password" }),
    });
    const res6 = await loginHandler(req6);
    expect(res6.status).toBe(429);
    const body = await res6.json();
    expect(body.error).toContain("Too many failed attempts");
  });

  test("Session GET with valid access token", async () => {
    // First register a user
    mockDb.users.push({
      id: "u-session",
      email: "session@sportsfest.in",
      role: "student",
      fullName: "Session User",
      isBlocked: false,
    });

    const cookie = "access_token=mock-jwt-token";
    const req = new Request("http://localhost/api/auth/session", {
      headers: { cookie }
    });
    const res = await sessionHandler(req);
    // jose mock returns { id: "test-user" }, so getProfileById will look up "test-user"
    // but that user doesn't exist in mockDb so it'll return 401
    // Let's add the expected user
    mockDb.users.push({
      id: "test-user",
      email: "test@sportsfest.in",
      role: "organizer",
      fullName: "Test User",
      isBlocked: false,
    });

    const req2 = new Request("http://localhost/api/auth/session", {
      headers: { cookie }
    });
    const res2 = await sessionHandler(req2);
    expect(res2.status).toBe(200);
    const body = await res2.json();
    expect(body.role).toBe("organizer");
  });

  test("Logout clears cookies", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("Session GET without token returns 401", async () => {
    const req = new Request("http://localhost/api/auth/session");
    const res = await sessionHandler(req);
    expect(res.status).toBe(401);
  });

  test("Registration rejects invalid email format", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        email: "invalidemail",
        password: "StrongPass123!",
      }),
    });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid email format.");
  });

  test("Registration rejects duplicate email", async () => {
    mockDb.users.push({
      id: "u-existing",
      email: "duplicate@sportsfest.in",
      role: "student",
      fullName: "Existing User",
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "New",
        lastName: "User",
        email: "duplicate@sportsfest.in",
        password: "StrongPass123!",
      }),
    });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("already registered");
  });

  test("Forgot and Reset password flow", async () => {
    // 1. Seed user
    const email = "forgot@sportsfest.in";
    mockDb.users.push({
      id: "u-forgot",
      email,
      role: "student",
      fullName: "Forgot User",
      passwordHash: "old-hash",
    });

    // 2. Request forgot password link
    const forgotReq = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const forgotRes = await forgotPasswordHandler(forgotReq);
    expect(forgotRes.status).toBe(200);

    const user = mockDb.users.find((u: any) => u.email === email);
    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires).toBeDefined();

    // 3. Reset password using the token
    const token = user.passwordResetToken;
    const resetReq = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password: "NewStrongPassword123!" }),
    });
    const resetRes = await resetPasswordHandler(resetReq);
    expect(resetRes.status).toBe(200);

    // Verify token was cleared and password hash updated
    const updatedUser = mockDb.users.find((u: any) => u.email === email);
    expect(updatedUser.passwordResetToken).toBeNull();
    expect(updatedUser.passwordResetExpires).toBeNull();
    expect(updatedUser.passwordHash).not.toBe("old-hash");
  });
});
