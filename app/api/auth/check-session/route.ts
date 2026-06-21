import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/backend/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("reset_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ valid: false });
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: sessionCookie,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true });
}
