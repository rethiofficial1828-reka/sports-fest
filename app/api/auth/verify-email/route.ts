import { NextResponse } from "next/server";
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
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 400 });
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    // Audit Log email verification
    await createAuditLog({
      userId: user.id,
      action: `Email verified successfully for user: ${user.email}`,
      ipAddress: ip,
      deviceInfo: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Email verification successful. You can now login."
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
