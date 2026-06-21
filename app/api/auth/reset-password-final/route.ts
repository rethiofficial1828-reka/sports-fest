import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("reset_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized or session expired." }, { status: 401 });
    }

    // Find the user with this valid session token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: sessionCookie,
        passwordResetExpires: {
          gt: new Date(), // Must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized or session expired." }, { status: 401 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update the password and clear all reset tokens securely
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        isEmailVerified: true,
      },
    });

    // Verification: Re-read the user and confirm the password was actually saved
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!updatedUser) {
      console.error("CRITICAL: User disappeared after password update!");
      return NextResponse.json({ error: "Failed to verify password update." }, { status: 500 });
    }

    const verifyNewPassword = await bcrypt.compare(password, updatedUser.passwordHash);
    if (!verifyNewPassword) {
      console.error("CRITICAL: Password hash mismatch after update! Hash was not saved correctly.");
      return NextResponse.json({ error: "Password update failed. Please try again." }, { status: 500 });
    }

    console.log(`Password successfully updated and verified for user ${user.id} (${user.email})`);


    // Clear the cookie
    cookieStore.delete("reset_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Final reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
