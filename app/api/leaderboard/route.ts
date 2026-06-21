import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";

export async function GET() {
  try {
    // Fetch all colleges ordered by eventsCount descending
    const colleges = await prisma.college.findMany({
      orderBy: {
        eventsCount: 'desc'
      },
      take: 10, // Top 10
      select: {
        id: true,
        name: true,
        eventsCount: true,
      }
    });

    // Map to add rank and a mock "points" logic since there's no native points column yet
    // E.g., each event count = 100 points, plus some minor randomness for flavor if eventsCount is same
    const leaderboard = colleges.map((college, idx) => ({
      rank: idx + 1,
      id: college.id,
      name: college.name,
      events: college.eventsCount,
      points: college.eventsCount * 100, // Simplistic point calculation for now
    }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
