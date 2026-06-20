import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createProfile, getProfileByEmail, createVerification, createAuditLog } from "@/backend/lib/services/dbService";
import { generateCsrfToken } from "@/backend/lib/utils/csrf";

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown";

  try {
    const data = await request.json();
    const { firstName, lastName, role, institution, email, password, contactNumber } = data;
    
    // Server-side Input validation
    const sanitizedEmail = (email || "").replace(/[<>]/g, "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // Password requirements
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

    const existing = await getProfileByEmail(sanitizedEmail);
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique verification token expiring in 24 hours
    const verificationToken = generateCsrfToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    const newProfile = {
      id: `u-${Date.now()}`,
      email: sanitizedEmail,
      role: role || "student",
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      institution: role === "organizer" ? institution : undefined,
      phone: role === "organizer" ? contactNumber : undefined,
      passwordHash,
      isBlocked: false,
      isEmailVerified: false, // Must verify email
      verificationToken,
      verificationTokenExpires,
      joinedDate: new Date().toISOString().split("T")[0],
    };

    const savedProfile = await createProfile(newProfile);

    // Log user registration
    await createAuditLog({
      userId: savedProfile.id,
      action: `User registered: ${sanitizedEmail} (Role: ${role})`,
      ipAddress: ip,
      deviceInfo: userAgent,
    });

    if (role === "organizer") {
      const verificationRequest = {
        id: `vr-${Date.now()}`,
        collegeName: institution,
        requester: `${firstName} ${lastName}`,
        email: sanitizedEmail,
        phone: contactNumber || "",
        date: new Date().toISOString().split("T")[0],
        status: "pending"
      };
      await createVerification(verificationRequest);

      // Log organizer verification request
      await createAuditLog({
        userId: savedProfile.id,
        action: `Organizer verification request created for ${sanitizedEmail}`,
        ipAddress: ip,
        deviceInfo: userAgent,
      });
    }

    // Print verification email link to terminal console (for development/testing)
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-fest.vercel.app"}/verify-email?token=${verificationToken}`;
    console.log("=========================================");
    console.log("✉️ EMAIL VERIFICATION SENT TO:", sanitizedEmail);
    console.log("🔗 LINK:", verificationLink);
    console.log("=========================================");

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user: {
        id: savedProfile.id,
        email: savedProfile.email,
        role: savedProfile.role,
        full_name: savedProfile.full_name,
        isEmailVerified: false,
      },
      verificationLink
    });
  } catch (error: any) {
    console.error("Registration error STACK:", error?.stack || error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
