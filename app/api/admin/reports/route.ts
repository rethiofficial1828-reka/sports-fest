import { NextResponse } from "next/server";
import { getReports, createReport, dismissReport, isSupabaseActive } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const reports = await getReports();
    return NextResponse.json(reports);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Publicly reporting an event
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { eventId, eventTitle, reason } = data;

    if (!eventId || !eventTitle || !reason) {
      return NextResponse.json({ error: "Event details and report reason are required." }, { status: 400 });
    }

    const report = {
      id: `rep-${Date.now()}`,
      eventId,
      eventTitle,
      reporter: user.email,
      reason,
      date: new Date().toISOString().split("T")[0],
      status: "active"
    };

    const saved = await createReport(report);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to submit report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }
    const result = await dismissReport(id);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to dismiss report" }, { status: 500 });
  }
}
