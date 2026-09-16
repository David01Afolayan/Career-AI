import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const student =
      (await db.student.findUnique({ where: { userId } })) ??
      (await db.student.create({ data: { userId } }));

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        cgpa: student.cgpa,
        interests: student.interests,
        experience: student.experience,
        projects: student.projects,
        certifications: student.certifications,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`profile:${session.user.id}`, 30, 10 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Too many profile updates. Please try again later." }, { status: 429, headers: rateLimitResponse(rateLimit.resetAt) });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Please correct the submitted profile information.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const data = parsed.data;

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { name: data.name },
    });

    const student = await db.student.upsert({
      where: { userId },
      create: {
        userId,
        matricNumber: data.matricNumber,
        department: data.department,
        level: data.level,
        cgpa: data.cgpa,
        interests: data.interests,
        experience: data.experience,
        projects: data.projects ?? 0,
        certifications: data.certifications ?? 0,
      },
      update: {
        matricNumber: data.matricNumber,
        department: data.department,
        level: data.level,
        cgpa: data.cgpa,
        interests: data.interests,
        experience: data.experience,
        projects: data.projects ?? 0,
        certifications: data.certifications ?? 0,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      profile: {
        name: user.name,
        email: user.email,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        cgpa: student.cgpa,
        interests: student.interests,
        experience: student.experience,
        projects: student.projects,
        certifications: student.certifications,
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
