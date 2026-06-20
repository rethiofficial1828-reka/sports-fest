import "@testing-library/jest-dom";

// Polyfill atob/btoa for Jest environment (jsdom doesn't always expose it globally in newer environments)
if (typeof global.atob === "undefined") {
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}
if (typeof global.btoa === "undefined") {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

// Polyfill TextEncoder/TextDecoder
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill Request, Response, Headers, fetch for Next.js routes
global.Request = globalThis.Request;
global.Response = globalThis.Response;
global.Headers = globalThis.Headers;
global.fetch = globalThis.fetch;

process.env.DATABASE_URL = "file:./dev.db";
process.env.JWT_SECRET = "a-very-long-and-secure-secret-key-that-exceeds-32-characters-for-jwt-signing";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

// --- Global mock for jose (ESM module) ---
jest.mock("jose", () => {
  return {
    jwtVerify: jest.fn().mockImplementation(async (token) => {
      try {
        const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
        return { payload };
      } catch (e) {
        if (token === "mock-jwt-token") {
          return { payload: { id: "test-user", role: "organizer", email: "test@sportsfest.in" } };
        }
        return { payload: { id: "default-user", role: "student", email: "default@sportsfest.in" } };
      }
    }),
    SignJWT: jest.fn().mockImplementation(() => ({
      setProtectedHeader: jest.fn().mockReturnThis(),
      setIssuedAt: jest.fn().mockReturnThis(),
      setExpirationTime: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue("mock-jwt-token"),
    })),
  };
});

// --- Global mock for bcryptjs ---
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$mockedhashedpasswordplaceholder"),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("mocked-salt"),
  default: {
    hash: jest.fn().mockResolvedValue("$2a$10$mockedhashedpasswordplaceholder"),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue("mocked-salt"),
  }
}));
