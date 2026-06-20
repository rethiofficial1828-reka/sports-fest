import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getSessionUser } from "@/backend/lib/auth/jwt";
import { validateCsrf } from "@/backend/lib/utils/csrf";

export async function GET(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: userPayload.id,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId: userPayload.id },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ sessions, loginHistory });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userPayload = await getSessionUser(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookiesHeader = request.headers.get("cookie") || "";
    const csrfCookie = cookiesHeader.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2];
    if (!validateCsrf(request, csrfCookie)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const { sessionId, action } = await request.json();

    if (action === "revoke" && sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() }
      });
      return NextResponse.json({ success: true, message: "Session revoked successfully" });
    }

    if (action === "trust" && sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isTrusted: true }
      });
      return NextResponse.json({ success: true, message: "Device marked as trusted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
