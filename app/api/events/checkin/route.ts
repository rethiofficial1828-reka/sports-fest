import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getSessionUser } from "@/backend/lib/auth/jwt";
import { validateCsrf } from "@/backend/lib/utils/csrf";

export async function POST(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    // Organizers/admins or verified check-in devices can check in users.
    if (!userPayload || (userPayload.role !== "organizer" && userPayload.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized. Organizer or admin role required." }, { status: 403 });
    }

    const { eventId, studentId } = await request.json();

    if (!eventId || !studentId) {
      return NextResponse.json({ error: "eventId and studentId are required" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: { eventId, userId: studentId }
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Student is not registered for this event." }, { status: 400 });
    }

    // Record attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        eventId_userId: { eventId, userId: studentId }
      },
      update: {},
      create: {
        eventId,
        userId: studentId
      }
    });

    // Update attendanceCount
    const attendCount = await prisma.attendance.count({ where: { eventId } });
    await prisma.event.update({
      where: { id: eventId },
      data: { attendanceCount: attendCount }
    });

    return NextResponse.json({
      success: true,
      message: `Check-in successful for ${registration.userName}`,
      attendance
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
