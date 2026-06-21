import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Find user in Prisma
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // To prevent email enumeration, return success even if user not found
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiresAt,
      },
    });

    // Configure Nodemailer with Gmail SMTP
    // You MUST set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"SportsFest Support" <${process.env.GMAIL_USER}>`,
      to: sanitizedEmail,
      subject: "Your Password Reset Code",
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #111827;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your SportsFest account. Here is your 6-digit recovery code:</p>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 5px; color: #6B46C1;">${otp}</strong>
          </div>
          <p style="color: #475569; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
  }
}
