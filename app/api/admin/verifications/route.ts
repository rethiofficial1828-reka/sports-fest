import { NextResponse } from "next/server";
import { getVerifications, createVerification, removeVerification, verifyCollege, isSupabaseActive } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const list = await getVerifications();
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load verifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Publicly requesting verification (e.g. during register)
  try {
    const data = await request.json();
    const { collegeName, requester, email, phone } = data;

    if (!collegeName || !requester) {
      return NextResponse.json({ error: "College name and requester details are required." }, { status: 400 });
    }

    const verification = {
      id: `vr-${Date.now()}`,
      collegeName,
      requester,
      email: email || "",
      phone: phone || "",
      date: new Date().toISOString().split("T")[0],
      status: "pending"
    };

    const saved = await createVerification(verification);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to submit verification request" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { id, collegeName, action } = data; // action: 'approve' or 'reject'

    if (!id) {
      return NextResponse.json({ error: "Verification ID is required." }, { status: 400 });
    }

    if (action === "approve") {
      await verifyCollege(collegeName);
    }
    
    // Remove request from active verifications list once resolved
    await removeVerification(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to resolve verification request" }, { status: 500 });
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
      return NextResponse.json({ error: "Verification ID is required." }, { status: 400 });
    }
    await removeVerification(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete request" }, { status: 500 });
  }
}
