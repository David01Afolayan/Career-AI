import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

    const body = await request.json();
    const {
      name,
      matricNumber,
      department,
      level,
      cgpa,
      interests,
      experience,
      projects,
      certifications,
    } = body;

    if (!name || !department) {
      return NextResponse.json(
        { error: "Name and department are required." },
        { status: 400 }
      );
    }

    const numericCgpa =
      cgpa !== null && cgpa !== undefined && cgpa !== ""
        ? Number(cgpa)
        : null;

    if (
      numericCgpa !== null &&
      (!Number.isFinite(numericCgpa) || numericCgpa < 0 || numericCgpa > 5)
    ) {
      return NextResponse.json(
        { error: "CGPA must be between 0 and 5." },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { name: String(name).trim() },
    });

    const student = await db.student.upsert({
      where: { userId },
      create: {
        userId,
        matricNumber: matricNumber ? String(matricNumber).trim() : null,
        department: String(department).trim(),
        level:
          level !== null && level !== undefined && level !== ""
            ? Number(level)
            : null,
        cgpa: numericCgpa,
        interests: interests ? String(interests).trim() : null,
        experience: experience ? String(experience).trim() : null,
        projects:
          projects !== null && projects !== undefined && projects !== ""
            ? Number(projects)
            : 0,
        certifications:
          certifications !== null &&
          certifications !== undefined &&
          certifications !== ""
            ? Number(certifications)
            : 0,
      },
      update: {
        matricNumber: matricNumber ? String(matricNumber).trim() : null,
        department: String(department).trim(),
        level:
          level !== null && level !== undefined && level !== ""
            ? Number(level)
            : null,
        cgpa: numericCgpa,
        interests: interests ? String(interests).trim() : null,
        experience: experience ? String(experience).trim() : null,
        projects:
          projects !== null && projects !== undefined && projects !== ""
            ? Number(projects)
            : 0,
        certifications:
          certifications !== null &&
          certifications !== undefined &&
          certifications !== ""
            ? Number(certifications)
            : 0,
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
