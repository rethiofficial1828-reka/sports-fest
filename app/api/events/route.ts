import { NextResponse } from "next/server";
import { getEvents, createEvent, updateEvent, isSupabaseActive } from "@/backend/lib/services/dbService";
import { createClient } from "@/backend/lib/supabase/server";
import { checkRateLimit } from "@/backend/lib/utils/rateLimit";

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

import { getSessionUser } from "@/backend/lib/auth/jwt";

export async function GET(request: Request) {
  const ip = getIp(request);
  const rateLimitCheck = checkRateLimit(ip, "get-events", 60, 60 * 1000); // 60 requests per min
  if (!rateLimitCheck.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const rateLimitCheck = checkRateLimit(ip, "create-event", 10, 60 * 1000); // 10 requests per min
  if (!rateLimitCheck.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const user = await getSessionUser(request);
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized. Access denied." }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { 
      eventDate, 
      registrationDeadline, 
      title, 
      sport, 
      posterUrl, 
      fee, 
      level, 
      description, 
      registrationUrl,
      category,
      location,
      minParticipants,
      isTeamEvent,
      teamSize,
      minTeamSize,
      maxTeamSize,
      prizePool,
      prizeFirst,
      prizeSecond,
      prizeThird,
      rewardsAdditional,
      trophyInfo,
      certificateInfo,
      rules,
      eligibility,
      rulesTeam,
      equipmentRequirements,
      conductRules,
      disqualificationConditions,
      contactName,
      contactEmail,
      contactPhone,
      contactAlternatePhone,
      collegeName,
      rulebookUrl,
      brochureUrl
    } = data;

    // Server-side Date Validations
    if (!eventDate || !registrationDeadline) {
      return NextResponse.json({ error: "Both event start date and registration deadline are required." }, { status: 400 });
    }

    const eventDateObj = new Date(eventDate);
    const regDeadlineObj = new Date(registrationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDateObj < today) {
      return NextResponse.json({ error: "Event start date cannot be in the past." }, { status: 400 });
    }

    if (regDeadlineObj < today) {
      return NextResponse.json({ error: "Registration deadline cannot be in the past." }, { status: 400 });
    }

    const eventDay = new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), eventDateObj.getDate());
    const regDay = new Date(regDeadlineObj.getFullYear(), regDeadlineObj.getMonth(), regDeadlineObj.getDate());

    if (regDay >= eventDay) {
      return NextResponse.json({ error: "Registration deadline must be at least one day before the event start date." }, { status: 400 });
    }

    // Prepare and insert event
    const eventSlug = (title || "event").toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
    const newEvent = {
      id: "evt_" + Date.now().toString(),
      title: title || "Untitled Event",
      slug: eventSlug,
      description: description || "",
      organizerId: user.id,
      college: data.college || {
        name: user.institution || "IIT Madras",
        short_name: (user.institution || "IIT Madras").substring(0, 3).toUpperCase(),
        slug: (user.institution || "IIT Madras").toLowerCase().replace(/\s+/g, '-'),
        city: "Chennai",
        state: "Tamil Nadu"
      },
      sport: sport || {
        name: "Cricket",
        icon: "🏏",
        color: "#2ECC71"
      },
      eventDate: eventDateObj.toISOString(),
      registrationDeadline: regDeadlineObj.toISOString(),
      mode: data.mode || "offline",
      fee: Number(fee) || 0,
      posterUrl: posterUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      isLive: data.isLive !== undefined ? data.isLive : true,
      status: data.status || "approved",
      isFeatured: data.isFeatured || false,
      participantCount: 0,
      level: level || "zonal",
      registrationUrl: registrationUrl || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // New fields mapping
      category: category || "General",
      location: location || "",
      minParticipants: Number(minParticipants) || 1,
      isTeamEvent: isTeamEvent !== undefined ? Boolean(isTeamEvent) : false,
      teamSize: Number(teamSize) || 1,
      minTeamSize: Number(minTeamSize) || 1,
      maxTeamSize: Number(maxTeamSize) || 1,
      
      prizePool: Number(prizePool) || 0,
      prizeFirst: prizeFirst || "",
      prizeSecond: prizeSecond || "",
      prizeThird: prizeThird || "",
      rewardsAdditional: rewardsAdditional || "",
      trophyInfo: trophyInfo || "",
      certificateInfo: certificateInfo || "",

      rules: rules || "",
      eligibility: eligibility || "",
      rulesTeam: rulesTeam || "",
      equipmentRequirements: equipmentRequirements || "",
      conductRules: conductRules || "",
      disqualificationConditions: disqualificationConditions || "",

      contactName: contactName || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      contactAlternatePhone: contactAlternatePhone || "",
      collegeName: collegeName || "",

      rulebookUrl: rulebookUrl || "",
      brochureUrl: brochureUrl || ""
    };

    const savedEvent = await createEvent(newEvent);
    return NextResponse.json(savedEvent);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized. Access denied." }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { id, eventDate, registrationDeadline, ...updatedFields } = data;
    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Enforce date validation if dates are being modified
    if (eventDate || registrationDeadline) {
      const dbEvents = await getEvents();
      const existingEvent = dbEvents.find((e: any) => e.id === id);
      if (!existingEvent) {
        return NextResponse.json({ error: "Event not found." }, { status: 404 });
      }

      const finalEventDate = eventDate ? new Date(eventDate) : new Date(existingEvent.eventDate);
      const finalRegDeadline = registrationDeadline ? new Date(registrationDeadline) : new Date(existingEvent.registrationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate && finalEventDate < today) {
        return NextResponse.json({ error: "Event start date cannot be in the past." }, { status: 400 });
      }
      if (registrationDeadline && finalRegDeadline < today) {
        return NextResponse.json({ error: "Registration deadline cannot be in the past." }, { status: 400 });
      }

      const eventDay = new Date(finalEventDate.getFullYear(), finalEventDate.getMonth(), finalEventDate.getDate());
      const regDay = new Date(finalRegDeadline.getFullYear(), finalRegDeadline.getMonth(), finalRegDeadline.getDate());

      if (regDay >= eventDay) {
        return NextResponse.json({ error: "Registration deadline must be at least one day before the event start date." }, { status: 400 });
      }

      updatedFields.eventDate = finalEventDate.toISOString();
      updatedFields.registrationDeadline = finalRegDeadline.toISOString();
    }

    const result = await updateEvent(id, updatedFields);
    if (!result) {
      return NextResponse.json({ error: "Event not found or failed to update." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized. Access denied." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Cancel/soft-delete
    const result = await updateEvent(id, { isCancelled: true, status: "cancelled" });
    if (!result) {
      return NextResponse.json({ error: "Event not found or failed to cancel." }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to cancel event" }, { status: 500 });
  }
}
