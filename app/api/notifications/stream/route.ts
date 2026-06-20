import { NextRequest, NextResponse } from "next/server";
import { isSupabaseActive, getNotifications } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";

import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;
  let lastCount = 0;

  req.signal.addEventListener("abort", () => {
    isClosed = true;
    writer.close();
  });

  const sendEvent = async (data: any) => {
    if (isClosed) return;
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (!isClosed) {
      sendEvent({ type: "ping", time: new Date().toISOString() });
    }
  }, 15000);

  // Poll database for new notifications
  const pollInterval = setInterval(async () => {
    if (isClosed) {
      clearInterval(pollInterval);
      clearInterval(pingInterval);
      return;
    }
    try {
      const notifications = await getNotifications();
      // Filter for this user and unread ones
      const userNotifications = notifications.filter(
        (n: any) => (n.userId === "all" || n.userId === user.id || n.userId === user.sub) && !n.isRead
      );
      
      if (userNotifications.length !== lastCount) {
        lastCount = userNotifications.length;
        sendEvent({ type: "notifications", data: userNotifications });
      }
    } catch (e) {
      console.error("Error polling notifications:", e);
    }
  }, 5000); // Poll every 5 seconds

  // Initial fetch
  getNotifications().then(notifications => {
    const userNotifications = notifications.filter(
      (n: any) => (n.userId === "all" || n.userId === user.id || n.userId === user.sub) && !n.isRead
    );
    lastCount = userNotifications.length;
    sendEvent({ type: "notifications", data: userNotifications });
  }).catch(e => console.error(e));

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
