import { NextResponse } from "next/server";
import { getRegistrations, createRegistration, isSupabaseActive } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";

import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const regs = await getRegistrations();
    return NextResponse.json(regs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load registrations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { eventId, eventTitle, userName, userEmail, college } = data;

    if (!eventId || !eventTitle) {
      return NextResponse.json({ error: "Event details are required for registration." }, { status: 400 });
    }

    const newReg = {
      id: `reg-${Date.now()}`,
      eventId,
      eventTitle,
      userId: user.id,
      userName: userName || user.full_name || "Student Participant",
      userEmail: userEmail || user.email || "student@sportsfest.in",
      college: college || user.institution || "Other College",
      date: new Date().toISOString().split("T")[0],
    };

    const savedReg = await createRegistration(newReg);
    if ((savedReg as any).isWaitlisted) {
      return NextResponse.json({ message: "Event is full. You have been added to the waitlist.", waitlisted: true, data: savedReg }, { status: 201 });
    }
    return NextResponse.json(savedReg);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Registration failed." }, { status: 500 });
  }
}
