import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify the user has a valid Supabase session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized. Valid session required." }, { status: 401 });
    }

    // Hash the new password and update Prisma
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { email: user.email.toLowerCase() },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Sync password error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
