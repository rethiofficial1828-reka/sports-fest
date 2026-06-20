import { NextResponse } from "next/server";
import { getAuditLogs, isSupabaseActive } from "@/backend/lib/services/dbService";
import * as jose from "jose";

const SECRET_KEY_STRING = process.env.JWT_SECRET || "a-very-long-and-secure-secret-key-that-exceeds-32-characters-for-jwt-signing";
const SECRET_KEY = new TextEncoder().encode(SECRET_KEY_STRING);

async function getSessionUser(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const getCookie = (name: string) => {
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };
  const token = getCookie("access_token");
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (e) {}
  return null;
}

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load audit logs" }, { status: 500 });
  }
}
