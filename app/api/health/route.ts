import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";

export async function GET() {
  try {
    // 1. Verify DB connection
    await prisma.user.findFirst();
    
    return NextResponse.json({
      status: "UP",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "DOWN",
      database: "disconnected",
      error: e.message || "Failed to query database"
    }, { status: 503 });
  }
}
