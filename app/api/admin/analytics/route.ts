import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();
    const waitlistCount = await prisma.waitlist.count();

    const failedLoginsCount = await prisma.loginHistory.count({
      where: { status: "failed" }
    });

    const collegesData = await prisma.college.findMany({
      select: {
        id: true,
        name: true,
        isVerified: true,
        eventsCount: true
      },
      take: 10,
      orderBy: { eventsCount: "desc" }
    });

    const userRoles = await prisma.user.groupBy({
      by: ["role"],
      _count: true
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        waitlistCount,
        failedLoginsCount,
        securityThreatLevel: failedLoginsCount > 20 ? "High" : failedLoginsCount > 5 ? "Medium" : "Low"
      },
      collegesData,
      userRoles
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
