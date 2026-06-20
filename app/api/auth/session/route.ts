import { NextResponse } from "next/server";
import { getProfileById } from "@/backend/lib/services/dbService";
import { verifyToken, signAccessToken, signRefreshToken } from "@/backend/lib/auth/jwt";
import { generateCsrfToken } from "@/backend/lib/utils/csrf";

export async function GET(request: Request) {
  try {
    const cookiesHeader = request.headers.get("cookie") || "";
    const getCookie = (name: string) => {
      const match = cookiesHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");

    let userPayload: any = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;

    if (accessToken) {
      userPayload = await verifyToken(accessToken);
    }

    if (!userPayload && refreshToken) {
      const refreshPayload: any = await verifyToken(refreshToken);
      if (refreshPayload) {
        const profile = await getProfileById(refreshPayload.id);
        if (profile && !profile.isBlocked) {
          userPayload = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            full_name: profile.full_name || profile.fullName,
            institution: profile.institution,
          };
          newAccessToken = await signAccessToken(userPayload);
          newRefreshToken = await signRefreshToken({ id: profile.id, email: profile.email, role: profile.role });
        }
      }
    }

    // Generate CSRF token for the frontend to include in mutating requests
    const csrfToken = generateCsrfToken();

    let response: NextResponse;
    if (userPayload) {
      const profile = await getProfileById(userPayload.id);
      if (profile && !profile.isBlocked) {
        response = NextResponse.json({
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
          csrfToken,
        });
      } else {
        // Blocked or deleted user
        response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        response.cookies.delete("session");
        return response;
      }
    } else {
      response = NextResponse.json({ error: "Unauthorized", csrfToken }, { status: 401 });
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("session");
    }

    // Set CSRF token cookie (accessible to JS for double-submit header copy)
    response.cookies.set("csrf_token", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    if (newAccessToken && newRefreshToken) {
      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/",
      });

      response.cookies.set("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 3600,
        path: "/",
      });

      response.cookies.set("session", "true", {
        path: "/",
      });
    }

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  // Logout action
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("session");
    response.cookies.delete("csrf_token");
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
