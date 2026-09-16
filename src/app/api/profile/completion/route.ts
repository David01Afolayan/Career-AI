import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await db.student.findUnique({
      where: { userId },
      include: { skills: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    const checks = {
      name: Boolean(user?.name),
      matricNumber: Boolean(student.matricNumber),
      department: Boolean(student.department),
      level: student.level !== null,
      cgpa: student.cgpa !== null,
      interests: Boolean(student.interests),
      experience: Boolean(student.experience),
      projects: student.projects > 0,
      certifications: student.certifications > 0,
      skills: student.skills.length > 0,
    };

    const totalFields = Object.keys(checks).length;
    const completedFields = Object.values(checks).filter(Boolean).length;
    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100
    );

    return NextResponse.json({
      completionPercentage,
      completedFields,
      totalFields,
      readyForRecommendation:
        completionPercentage >= 70 && student.skills.length >= 3,
      checks,
    });
  } catch (error) {
    console.error("Profile completion error:", error);

    return NextResponse.json(
      { error: "Failed to calculate profile completion" },
      { status: 500 }
    );
  }
}
