import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: { eventId, userId: userPayload.id }
      },
      include: {
        event: true
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "No registration found for this event." }, { status: 404 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        eventId_userId: { eventId, userId: userPayload.id }
      }
    });

    if (!attendance && registration.event.status !== "completed") {
      return NextResponse.json({ error: "Certificate only issued for attended/completed tournaments." }, { status: 400 });
    }

    const studentName = registration.userName;
    const eventTitle = registration.event.title;
    const dateOfIssue = new Date().toISOString().split("T")[0];
    const validationHash = `CERT-${eventId.substring(0, 4)}-${userPayload.id.substring(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return NextResponse.json({
      studentName,
      eventTitle,
      sportName: registration.event.sportName,
      dateOfIssue,
      validationHash,
      pdfBlobMock: `BASE64-CERTIFICATE-PAYLOAD-MOCK-FOR-${validationHash}`
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
