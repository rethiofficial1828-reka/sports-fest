import { NextResponse } from "next/server";
import { getNotifications, createNotification, updateNotification, deleteNotification } from "@/backend/lib/services/dbService";

export async function GET() {
  try {
    const list = await getNotifications();
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const notif = {
      id: `nt-${Date.now()}`,
      userId: data.userId || "all",
      text: data.text || "System Alert",
      date: new Date().toISOString().split("T")[0],
      isRead: false,
      type: data.type || "system",
      ...data
    };
    const saved = await createNotification(notif);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, isRead } = data;
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }
    const result = await updateNotification(id, { isRead });
    if (!result) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }
    const result = await deleteNotification(id);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete notification" }, { status: 500 });
  }
}
