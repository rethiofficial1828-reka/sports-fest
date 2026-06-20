import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getProfileByEmail, createAuditLog } from "@/backend/lib/services/dbService";
import { signAccessToken, signRefreshToken } from "@/backend/lib/auth/jwt";
import { prisma } from "@/backend/lib/prisma";

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown";

  try {
    const { email, password } = await request.json();
    const sanitizedEmail = (email || "").replace(/[<>]/g, "").trim().toLowerCase();
    
    // Check global lockout list via Prisma
    const lockData = await prisma.loginAttempt.findUnique({
      where: { email: sanitizedEmail }
    });

    if (lockData) {
      if (lockData.attempts >= 5 && lockData.lockoutUntil && lockData.lockoutUntil > new Date()) {
        const remaining = Math.ceil((lockData.lockoutUntil.getTime() - Date.now()) / 1000);
        // Log failed login due to lockout
        await createAuditLog({
          userId: null,
          action: `Failed login: Locked out user ${sanitizedEmail}`,
          ipAddress: ip,
          deviceInfo: userAgent,
        });

        return NextResponse.json(
          { error: `Too many failed attempts. Account is locked. Try again in ${remaining}s.` },
          { status: 429 }
        );
      } else if (lockData.lockoutUntil && lockData.lockoutUntil <= new Date()) {
        // Lockout expired, clear attempts
        await prisma.loginAttempt.delete({
          where: { email: sanitizedEmail }
        });
      }
    }

    const profile = await getProfileByEmail(sanitizedEmail);

    if (!profile) {
      // Record failed attempt
      const attempts = (lockData?.attempts || 0) + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await prisma.loginAttempt.upsert({
        where: { email: sanitizedEmail },
        update: { attempts, lockoutUntil },
        create: { email: sanitizedEmail, attempts, lockoutUntil }
      });

      // Audit Log failed login
      await createAuditLog({
        userId: null,
        action: `Failed login attempt: Email not found (${sanitizedEmail})`,
        ipAddress: ip,
        deviceInfo: userAgent,
      });

      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (profile.isBlocked) {
      // Audit Log blocked login
      await createAuditLog({
        userId: profile.id,
        action: `Failed login: Blocked account login attempt (${sanitizedEmail})`,
        ipAddress: ip,
        deviceInfo: userAgent,
      });

      return NextResponse.json({ error: "Your account is blocked. Please contact admin." }, { status: 403 });
    }

    // Email verification check
    if (!profile.isEmailVerified && profile.role !== "admin") {
      // Audit Log unverified login
      await createAuditLog({
        userId: profile.id,
        action: `Failed login: Unverified email login attempt (${sanitizedEmail})`,
        ipAddress: ip,
        deviceInfo: userAgent,
      });

      const devVerificationLink = process.env.NODE_ENV !== "production"
        ? `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-fest.vercel.app"}/verify-email?token=${profile.verificationToken}`
        : undefined;

      return NextResponse.json({
        error: "Please verify your email address before logging in.",
        verificationLink: devVerificationLink
      }, { status: 403 });
    }

    const passwordValid = await bcrypt.compare(password, profile.passwordHash);
    if (!passwordValid) {
      // Record failed attempt
      const attempts = (lockData?.attempts || 0) + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await prisma.loginAttempt.upsert({
        where: { email: sanitizedEmail },
        update: { attempts, lockoutUntil },
        create: { email: sanitizedEmail, attempts, lockoutUntil }
      });

      // Log failed history safely
      if (prisma.loginHistory) {
        await prisma.loginHistory.create({
          data: {
            userId: profile.id,
            ipAddress: ip,
            userAgent: userAgent,
            status: "failed",
            reason: "Invalid password"
          }
        });
      }

      // Audit Log failed login
      await createAuditLog({
        userId: profile.id,
        action: `Failed login: Invalid password for ${sanitizedEmail}`,
        ipAddress: ip,
        deviceInfo: userAgent,
      });

      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Success: clear lockout
    await prisma.loginAttempt.deleteMany({
      where: { email: sanitizedEmail }
    });

    // Log successful history safely
    if (prisma.loginHistory) {
      await prisma.loginHistory.create({
        data: {
          userId: profile.id,
          ipAddress: ip,
          userAgent: userAgent,
          status: "success"
        }
      });
    }

    // Check if 2FA is enabled
    if (profile.twoFactorEnabled) {
      return NextResponse.json({
        twoFactorRequired: true,
        userId: profile.id,
        message: "Two-factor authentication code is required."
      });
    }

    // Create active Session in Database safely
    let sessionId = "mock-sess-id";
    if (prisma.session) {
      const sessionRecord = await prisma.session.create({
        data: {
          userId: profile.id,
          userAgent,
          ipAddress: ip,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
        }
      });
      sessionId = sessionRecord.id;
    }

    // Audit Log success login
    await createAuditLog({
      userId: profile.id,
      action: `Successful login for ${sanitizedEmail}. Session ID: ${sessionId}`,
      ipAddress: ip,
      deviceInfo: userAgent,
    });

    // Real Signed JWT Access and Refresh Tokens
    const payload = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name || profile.fullName,
      institution: profile.institution,
      sessionId
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken({ id: profile.id, email: profile.email, role: profile.role, sessionId });

    const response = NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: profile.full_name || profile.fullName,
        institution: profile.institution,
        user_metadata: {
          full_name: profile.full_name || profile.fullName,
          institution: profile.institution,
        }
      },
      role: profile.role,
    });

    // Set secure HTTP-only cookies
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 3600, // 7 days
      path: "/",
    });

    response.cookies.set("session", "true", {
      path: "/",
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
