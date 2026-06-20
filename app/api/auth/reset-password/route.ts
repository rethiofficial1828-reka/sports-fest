import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAuditLog } from "@/backend/lib/services/dbService";
import { prisma } from "@/backend/lib/prisma";

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown";

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    // Validate password strength
    const passwordStr = password || "";
    if (
      passwordStr.length < 8 ||
      !/[A-Z]/.test(passwordStr) ||
      !/[a-z]/.test(passwordStr) ||
      !/[0-9]/.test(passwordStr) ||
      !/[^A-Za-z0-9]/.test(passwordStr)
    ) {
      return NextResponse.json(
        { error: "Password must be 8+ chars and contain upper, lower, number, and special character." },
        { status: 400 }
      );
    }

    // Hash and update
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    // Audit Log success password reset
    await createAuditLog({
      userId: user.id,
      action: `Password reset successfully completed for user: ${user.email}`,
      ipAddress: ip,
      deviceInfo: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
