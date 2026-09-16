import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase().replace(/&/g, "and");
}

function parseSkills(requiredSkills: string) {
  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const latestAssessment = await db.assessment.findFirst({
      where: {
        userId: Number(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const assessedSkills = new Set(
      (latestAssessment?.strengths ?? "")
        .split(",")
        .map(normalizeSkill)
        .filter(Boolean)
    );

    const careers = await db.career.findMany({
      orderBy: {
        title: "asc",
      },
    });

    const results = careers.map((career) => {
      const requiredSkills = parseSkills(career.requiredSkills);
      const matchedSkills = requiredSkills.filter((skill) =>
        assessedSkills.has(normalizeSkill(skill))
      );
      const missingSkills = requiredSkills.filter(
        (skill) => !assessedSkills.has(normalizeSkill(skill))
      );

      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
          : 0;

      return {
        career: career.title,
        description: career.description,
        category: career.category,
        salaryRange: career.salaryRange,
        matchPercentage,
        matchedSkills,
        missingSkills,
      };
    });

    results.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Career matching error:", error);

    return NextResponse.json(
      { error: "Unable to calculate career matches." },
      { status: 500 }
    );
  }
}
