import { prisma } from "@/backend/lib/prisma";

/**
 * Checks if a request from an IP on an endpoint exceeds the rate limit.
 * @param ip Client IP address
 * @param endpoint Endpoint identifier
 * @param limit Maximum number of requests allowed
 * @param windowMs Time window in milliseconds
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const key = `${ip}:${endpoint}`;
    const now = new Date();
    const resetTime = new Date(now.getTime() + windowMs);

    // Using transaction to prevent race conditions as best as possible
    // or we can use upsert. Upsert is safer.
    const record = await prisma.rateLimit.upsert({
      where: { key },
      update: {},
      create: {
        key,
        count: 1,
        resetTime: resetTime,
      },
    });

    if (now > record.resetTime) {
      // Time window expired, reset the count
      const updated = await prisma.rateLimit.update({
        where: { key },
        data: {
          count: 1,
          resetTime: resetTime,
        },
      });
      return { success: true, remaining: limit - 1, resetTime: updated.resetTime.getTime() };
    }

    if (record.count >= limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetTime: record.resetTime.getTime() };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return { success: true, remaining: limit - updated.count, resetTime: updated.resetTime.getTime() };
  } catch (e) {
    // If DB operation fails, fail open to avoid blocking valid traffic
    console.error("Rate limit check failed:", e);
    return { success: true, remaining: 1, resetTime: Date.now() + windowMs };
  }
}
