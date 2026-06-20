import { NextResponse } from "next/server";
import { getProfiles, updateProfileBlock, updateProfileRole, isSupabaseActive } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";
import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const profiles = await getProfiles();
    return NextResponse.json(profiles);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load profiles" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { id, isBlocked, role } = data;

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    let result = null;

    if (isBlocked !== undefined) {
      result = await updateProfileBlock(id, isBlocked);
    } else if (role !== undefined) {
      result = await updateProfileRole(id, role);
    }

    if (!result) {
      return NextResponse.json({ error: "User not found or modification failed." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update profile" }, { status: 500 });
  }
}
