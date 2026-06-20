import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    if (!userPayload || (userPayload.role !== "organizer" && userPayload.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden. Organizer or admin role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const download = searchParams.get("download");

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          registrations: true,
          attendances: true
        }
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Check ownership
      if (userPayload.role !== "admin" && event.organizerId !== userPayload.id) {
        return NextResponse.json({ error: "Forbidden. You are not the organizer of this event." }, { status: 403 });
      }

      if (download === "csv") {
        const headers = ["Registration ID", "User ID", "User Name", "User Email", "College", "Registration Date", "Checked In"];
        const rows = event.registrations.map(r => {
          const attended = event.attendances.some(a => a.userId === r.userId) ? "YES" : "NO";
          return [r.id, r.userId, r.userName, r.userEmail, r.college, r.date, attended];
        });

        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="attendance-report-${event.slug}.csv"`
          }
        });
      }

      // Calculate conversion rates
      const views = event.views || 0;
      const registrations = event.registrations.length;
      const conversionRate = views > 0 ? ((registrations / views) * 100).toFixed(1) + "%" : "0%";
      const attendanceRate = registrations > 0 ? ((event.attendances.length / registrations) * 100).toFixed(1) + "%" : "0%";

      return NextResponse.json({
        event: {
          id: event.id,
          title: event.title,
          views,
          registrationsCount: registrations,
          attendanceCount: event.attendances.length,
          conversionRate,
          attendanceRate
        }
      });
    }

    // List all organizer events summary
    const events = await prisma.event.findMany({
      where: userPayload.role === "admin" ? {} : { organizerId: userPayload.id },
      include: {
        registrations: true,
        attendances: true
      }
    });

    const summary = events.map(e => {
      const conversionRate = e.views > 0 ? ((e.registrations.length / e.views) * 100).toFixed(1) + "%" : "0%";
      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        views: e.views,
        registrationsCount: e.registrations.length,
        attendanceCount: e.attendances.length,
        conversionRate
      };
    });

    return NextResponse.json({ events: summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
