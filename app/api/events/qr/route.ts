import { NextResponse } from "next/server";
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

    // Return check-in QR metadata & URL
    return NextResponse.json({
      eventId,
      checkInUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-fest.vercel.app"}/api/events/checkin?eventId=${eventId}&studentId=${userPayload.id}`,
      token: `CHECKIN-JWT-MOCK-${eventId}-${userPayload.id}`
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
