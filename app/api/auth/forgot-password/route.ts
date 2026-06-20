import { Resend } from 'resend'
import { prisma } from '@/backend/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return Response.json(
        { message: 'If this email exists, a reset link will be sent' },
        { status: 200 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    const { origin } = new URL(request.url)
    const resetUrl = `${origin}/reset-password?token=${resetToken}`

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy') {
      console.log('RESET PASSWORD LINK (Resend is not configured):', resetUrl);
      return Response.json(
        { 
          message: 'Password reset link generated. Since no email service is configured, use the link below.',
          resetLink: resetUrl
        },
        { status: 200 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Your Password - SportsFest',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#7C3AED;">Reset Your Password</h2>
          <p>Hello ${user.fullName || 'there'},</p>
          <p>You requested to reset your SportsFest password.</p>
          <p>Click below to reset it. Link expires in 1 hour.</p>
          <a href="${resetUrl}"
             style="background:#7C3AED;color:white;padding:12px 24px;
                    text-decoration:none;border-radius:6px;
                    display:inline-block;margin:20px 0;">
            Reset Password
          </a>
          <p>Or copy: ${resetUrl}</p>
          <p>If you did not request this, ignore this email.</p>
          <p>Thanks,<br>The SportsFest Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Email error:', error)
      // Fallback if email fails
      return Response.json(
        { 
          message: 'Failed to send email, but link was generated.',
          resetLink: resetUrl 
        },
        { status: 200 }
      )
    }

    return Response.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json(
      { error: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
