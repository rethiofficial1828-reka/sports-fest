import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    // Check if token matches and is not expired
    if (user.resetToken !== otp || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    // Success! Generate a temporary session token (just for the reset step)
    // We'll store this in an HTTP-only cookie
    const resetSessionToken = Buffer.from(`${user.id}-${Date.now()}`).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set("reset_session", resetSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes to finish resetting
      path: "/",
    });

    // Also update Prisma with this session token so we can verify it in step 3
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetSessionToken,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
