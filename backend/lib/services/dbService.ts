import { prisma } from "@/backend/lib/prisma";

// Helper to map Prisma User to match old structure
function mapUser(u: any) {
  if (!u) return null;
  return {
    ...u,
    full_name: u.fullName,
    user_metadata: {
      full_name: u.fullName,
      institution: u.institution,
    }
  };
}

// Helper to map Prisma Event to match old structure with nested sport/college
function mapEvent(e: any) {
  if (!e) return null;
  return {
    ...e,
    sport: {
      name: e.sportName,
      icon: e.sportIcon,
      color: e.sportColor,
    },
    college: e.college ? {
      id: e.college.id,
      name: e.college.name,
      slug: e.college.slug,
      short_name: e.college.shortName,
      city: e.college.city,
      state: e.college.state,
      is_verified: e.college.isVerified,
      events_count: e.college.eventsCount,
    } : null
  };
}

// Helper to check if Supabase is active (we return false to enforce local SQL database)
export function isSupabaseActive() {
  return false;
}

// profiles database functions
export async function getProfiles() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
  return users.map(mapUser);
}

export async function createProfile(profile: any) {
  const emailLower = profile.email.toLowerCase();
  const exists = await prisma.user.findUnique({
    where: { email: emailLower }
  });
  if (exists) throw new Error("Email already registered.");

  const created = await prisma.user.create({
    data: {
      id: profile.id || undefined,
      email: emailLower,
      passwordHash: profile.passwordHash,
      role: profile.role || "student",
      firstName: profile.firstName || profile.full_name?.split(" ")[0] || "First",
      lastName: profile.lastName || profile.full_name?.split(" ")[1] || "Last",
      fullName: profile.fullName || profile.full_name || "First Last",
      institution: profile.institution || null,
      phone: profile.phone || null,
      department: profile.department || null,
      yearOfStudy: profile.yearOfStudy ? Number(profile.yearOfStudy) : null,
      avatarUrl: profile.avatarUrl || null,
      isBlocked: profile.isBlocked || false,
      isEmailVerified: profile.isEmailVerified || false,
      verificationToken: profile.verificationToken || null,
      verificationTokenExpires: profile.verificationTokenExpires || null,
      passwordResetToken: profile.passwordResetToken || null,
      passwordResetExpires: profile.passwordResetExpires || null,
      joinedDate: profile.joinedDate || new Date().toISOString().split("T")[0]
    }
  });

  return mapUser(created);
}

export async function getProfileById(id: string) {
  const u = await prisma.user.findUnique({ where: { id } });
  return mapUser(u);
}

export async function getProfileByEmail(email: string) {
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return mapUser(u);
}

export async function updateProfileBlock(id: string, isBlocked: boolean) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing && existing.role === "admin") {
    throw new Error("Admin accounts cannot be blocked.");
  }
  const u = await prisma.user.update({
    where: { id },
    data: { isBlocked }
  });
  return mapUser(u);
}

export async function updateProfileRole(id: string, role: any) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing && existing.role === "admin") {
    throw new Error("Admin roles cannot be changed.");
  }
  const u = await prisma.user.update({
    where: { id },
    data: { role }
  });
  return mapUser(u);
}

// events database functions
export async function getEvents() {
  const events = await prisma.event.findMany({
    include: { college: true },
    orderBy: { createdAt: "desc" }
  });
  return events.map(mapEvent);
}

export async function createEvent(event: any) {
  let collegeId = null;
  if (event.college) {
    const colName = event.college.name;
    const colSlug = event.college.slug || colName.toLowerCase().replace(/\s+/g, '-');
    const college = await prisma.college.upsert({
      where: { name: colName },
      update: {},
      create: {
        name: colName,
        slug: colSlug,
        shortName: event.college.short_name || event.college.shortName || colName.substring(0, 3).toUpperCase(),
        city: event.college.city || "Unknown",
        state: event.college.state || "India",
        isVerified: event.college.is_verified || event.college.isVerified || false,
      }
    });
    collegeId = college.id;
  }

  // Ensure organizer exists (unless mock-user-organizer)
  if (event.organizerId !== "mock-user-organizer") {
    const organizer = await prisma.user.findUnique({
      where: { id: event.organizerId }
    });
    if (!organizer) {
      throw new Error("Foreign key violation: Organizer profile not found.");
    }
  }

  const eventDate = new Date(event.eventDate || event.event_date);
  const registrationDeadline = new Date(event.registrationDeadline || event.registration_deadline);

  const created = await prisma.event.create({
    data: {
      id: event.id || undefined,
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      organizerId: event.organizerId,
      collegeId: collegeId,
      sportName: event.sport?.name || "Other",
      sportIcon: event.sport?.icon || "🏆",
      sportColor: event.sport?.color || "#999999",
      eventDate,
      registrationDeadline,
      mode: event.mode || "offline",
      fee: Number(event.fee) || 0,
      posterUrl: event.posterUrl || "",
      isLive: event.isLive !== undefined ? event.isLive : true,
      isCancelled: event.isCancelled !== undefined ? event.isCancelled : false,
      status: event.status || "pending",
      isFeatured: event.isFeatured || false,
      participantCount: Number(event.participantCount) || 0,
      maxParticipants: Number(event.maxParticipants) || 100,
      level: event.level || "zonal",
      registrationUrl: event.registrationUrl || null,
      rejectionReason: event.rejectionReason || null,
      approvedById: event.approvedById || null,

      // New fields mapping
      category: event.category || null,
      location: event.location || null,
      minParticipants: Number(event.minParticipants) || 1,
      isTeamEvent: event.isTeamEvent !== undefined ? Boolean(event.isTeamEvent) : false,
      teamSize: Number(event.teamSize) || 1,
      minTeamSize: Number(event.minTeamSize) || 1,
      maxTeamSize: Number(event.maxTeamSize) || 1,
      
      prizePool: Number(event.prizePool) || 0,
      prizeFirst: event.prizeFirst || null,
      prizeSecond: event.prizeSecond || null,
      prizeThird: event.prizeThird || null,
      rewardsAdditional: event.rewardsAdditional || null,
      trophyInfo: event.trophyInfo || null,
      certificateInfo: event.certificateInfo || null,

      rules: event.rules || null,
      eligibility: event.eligibility || null,
      rulesTeam: event.rulesTeam || null,
      equipmentRequirements: event.equipmentRequirements || null,
      conductRules: event.conductRules || null,
      disqualificationConditions: event.disqualificationConditions || null,

      contactName: event.contactName || null,
      contactEmail: event.contactEmail || null,
      contactPhone: event.contactPhone || null,
      contactAlternatePhone: event.contactAlternatePhone || null,
      collegeName: event.collegeName || null,

      rulebookUrl: event.rulebookUrl || null,
      brochureUrl: event.brochureUrl || null,
    },
    include: { college: true }
  });

  return mapEvent(created);
}

export async function updateEvent(id: string, updatedFields: any) {
  const data: any = { ...updatedFields };
  if (data.college) {
    const colName = data.college.name;
    const colSlug = data.college.slug || colName.toLowerCase().replace(/\s+/g, '-');
    const college = await prisma.college.upsert({
      where: { name: colName },
      update: {},
      create: {
        name: colName,
        slug: colSlug,
        shortName: data.college.short_name || data.college.shortName || colName.substring(0, 3).toUpperCase(),
        city: data.college.city || "Unknown",
        state: data.college.state || "India",
        isVerified: data.college.is_verified || data.college.isVerified || false,
      }
    });
    data.collegeId = college.id;
    delete data.college;
  }
  if (data.sport) {
    data.sportName = data.sport.name;
    data.sportIcon = data.sport.icon;
    data.sportColor = data.sport.color;
    delete data.sport;
  }
  if (data.eventDate) {
    data.eventDate = new Date(data.eventDate);
  }
  if (data.registrationDeadline) {
    data.registrationDeadline = new Date(data.registrationDeadline);
  }

  delete data.id;
  delete data.created_at;
  delete data.updated_at;

  const updated = await prisma.event.update({
    where: { id },
    data,
    include: { college: true }
  });

  return mapEvent(updated);
}

// registrations database functions
export async function getRegistrations() {
  return await prisma.registration.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createRegistration(registration: any) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: registration.eventId }
    });
    if (!event) {
      throw new Error("Foreign key violation: Event does not exist.");
    }

    const alreadyRegistered = await tx.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: registration.eventId,
          userId: registration.userId,
        }
      }
    });
    if (alreadyRegistered) {
      throw new Error("User is already registered for this event.");
    }

    const alreadyWaitlisted = await tx.waitlist.findFirst({
      where: {
        eventId: registration.eventId,
        userId: registration.userId,
      }
    });
    if (alreadyWaitlisted) {
      throw new Error("User is already on the waitlist for this event.");
    }

    if (event.participantCount >= event.maxParticipants) {
      const waitlist = await tx.waitlist.create({
        data: {
          eventId: registration.eventId,
          userId: registration.userId,
          userName: registration.userName || "",
          userEmail: registration.userEmail || "",
          college: registration.college || "",
        }
      });
      return { ...waitlist, isWaitlisted: true };
    }

    const reg = await tx.registration.create({
      data: {
        id: registration.id || undefined,
        eventId: registration.eventId,
        userId: registration.userId,
        userName: registration.userName || "",
        userEmail: registration.userEmail || "",
        college: registration.college || "",
        date: registration.date || new Date().toISOString().split("T")[0]
      }
    });

    await tx.event.update({
      where: { id: registration.eventId },
      data: {
        participantCount: {
          increment: 1,
        }
      }
    });

    return reg;
  });
}

export async function deleteRegistration(id: string) {
  return await prisma.$transaction(async (tx) => {
    const reg = await tx.registration.delete({
      where: { id }
    });

    if (!reg) return null;

    const nextInLine = await tx.waitlist.findFirst({
      where: { eventId: reg.eventId },
      orderBy: { createdAt: "asc" }
    });

    if (nextInLine) {
      // Promote from waitlist
      await tx.registration.create({
        data: {
          eventId: nextInLine.eventId,
          userId: nextInLine.userId,
          userName: nextInLine.userName,
          userEmail: nextInLine.userEmail,
          college: nextInLine.college,
          date: new Date().toISOString().split("T")[0]
        }
      });
      
      await tx.waitlist.delete({
        where: { id: nextInLine.id }
      });

      // We don't decrement participantCount because it just transferred
    } else {
      // No one on waitlist, decrement participantCount
      await tx.event.update({
        where: { id: reg.eventId },
        data: {
          participantCount: {
            decrement: 1,
          }
        }
      });
    }

    return reg;
  });
}

// notifications database functions
export async function getNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createNotification(notif: any) {
  return await prisma.notification.create({
    data: {
      id: notif.id || undefined,
      userId: notif.userId || "all",
      text: notif.text,
      date: notif.date || new Date().toISOString().split("T")[0],
      isRead: notif.isRead || false,
      type: notif.type || "system"
    }
  });
}

export async function updateNotification(id: string, updatedFields: any) {
  const data = { ...updatedFields };
  delete data.id;
  return await prisma.notification.update({
    where: { id },
    data
  });
}

export async function deleteNotification(id: string) {
  return await prisma.notification.delete({
    where: { id }
  });
}

// reports database functions
export async function getReports() {
  return await prisma.report.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createReport(report: any) {
  return await prisma.report.create({
    data: {
      id: report.id || undefined,
      eventId: report.eventId,
      eventTitle: report.eventTitle,
      reporter: report.reporter,
      reason: report.reason,
      date: report.date || new Date().toISOString().split("T")[0],
      status: report.status || "active"
    }
  });
}

export async function dismissReport(id: string) {
  return await prisma.report.delete({
    where: { id }
  });
}

// verifications database functions
export async function getVerifications() {
  return await prisma.verification.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createVerification(verification: any) {
  return await prisma.verification.create({
    data: {
      id: verification.id || undefined,
      collegeName: verification.collegeName,
      requester: verification.requester,
      email: verification.email,
      phone: verification.phone || "",
      date: verification.date || new Date().toISOString().split("T")[0],
      status: verification.status || "pending"
    }
  });
}

export async function removeVerification(id: string) {
  return await prisma.verification.delete({
    where: { id }
  });
}

// colleges database functions
export async function getColleges() {
  return await prisma.college.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createCollege(college: any) {
  const colName = college.name;
  const colSlug = college.slug || colName.toLowerCase().replace(/\s+/g, '-');
  return await prisma.college.upsert({
    where: { name: colName },
    update: {},
    create: {
      id: college.id || undefined,
      name: colName,
      slug: colSlug,
      shortName: college.shortName || college.short_name || colName.substring(0, 3).toUpperCase(),
      city: college.city || "Unknown",
      state: college.state || "India",
      isVerified: college.isVerified || college.is_verified || false,
      eventsCount: Number(college.eventsCount || college.events_count) || 0
    }
  });
}

export async function verifyCollege(collegeName: string) {
  const colSlug = collegeName.toLowerCase().replace(/\s+/g, '-');
  const college = await prisma.college.upsert({
    where: { name: collegeName },
    update: {
      isVerified: true
    },
    create: {
      name: collegeName,
      slug: colSlug,
      shortName: collegeName.substring(0, 3).toUpperCase(),
      city: "Unknown",
      state: "India",
      isVerified: true,
    }
  });
  return college;
}

export async function deleteCollege(id: string) {
  return await prisma.college.delete({
    where: { id }
  });
}

// Audit Log Functions
export async function createAuditLog(log: any) {
  return await prisma.auditLog.create({
    data: {
      userId: log.userId || null,
      action: log.action,
      ipAddress: log.ipAddress || null,
      deviceInfo: log.deviceInfo || null,
    }
  });
}

export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    }
  });
}

// Waitlist Functions
export async function getWaitlists() {
  return await prisma.waitlist.findMany({
    orderBy: {
      createdAt: "desc",
    }
  });
}

export async function createWaitlist(waitlist: any) {
  return await prisma.waitlist.create({
    data: {
      eventId: waitlist.eventId,
      userId: waitlist.userId,
      userName: waitlist.userName,
      userEmail: waitlist.userEmail,
      college: waitlist.college,
    }
  });
}

export async function deleteWaitlist(id: string) {
  return await prisma.waitlist.delete({
    where: { id }
  });
}

// Seeding standard Admin
async function ensureDefaultAdmin() {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@sportsfest.in";
  const adminPasswordHash = "$2b$10$B3/c.DVXNDHYBlgC4WVfQeSXoAWE9mLmt2OVbTdvEQju2eBHstsuy"; // Bcrypt hash for AdminPassword2026!
  
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail.toLowerCase() }
  });
  
  if (!existing) {
    await prisma.user.create({
      data: {
        id: "u-admin",
        email: adminEmail.toLowerCase(),
        passwordHash: adminPasswordHash,
        role: "admin",
        firstName: "Super",
        lastName: "Admin",
        fullName: "Super Admin",
        institution: "SportsFest HQ",
        isBlocked: false,
        isEmailVerified: true,
        joinedDate: new Date().toISOString().split("T")[0]
      }
    });
    console.log("Seeded default admin account");
  }
}

// Initialize seed
// if (process.env.NODE_ENV !== "test") {
//   ensureDefaultAdmin().catch(err => console.error("Error seeding default admin:", err));
// }
