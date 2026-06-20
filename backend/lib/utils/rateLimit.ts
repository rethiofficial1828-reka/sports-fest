import fs from "fs";
import path from "path";

const RATE_LIMIT_FILE = path.join(process.cwd(), "rate_limits.json");

/**
 * Checks if a request from an IP on an endpoint exceeds the rate limit.
 * @param ip Client IP address
 * @param endpoint Endpoint identifier
 * @param limit Maximum number of requests allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetTime: number } {
  try {
    let data: any = {};
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
      } catch (e) {
        data = {};
      }
    }
    
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const record = data[key];
    
    if (!record) {
      data[key] = { count: 1, resetTime: now + windowMs };
      fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
      return { success: true, remaining: limit - 1, resetTime: now + windowMs };
    }
    
    if (now > record.resetTime) {
      data[key] = { count: 1, resetTime: now + windowMs };
      fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
      return { success: true, remaining: limit - 1, resetTime: now + windowMs };
    }
    
    if (record.count >= limit) {
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }
    
    record.count += 1;
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
    return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
  } catch (e) {
    // If file operation fails, fail open to avoid blocking valid traffic
    return { success: true, remaining: 1, resetTime: Date.now() + windowMs };
  }
}
