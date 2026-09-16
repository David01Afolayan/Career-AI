import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeSkill(skill: string) {
  return skill
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseSkills(rawSkills: string | null | undefined) {
  return (rawSkills ?? "")
    .split(",")
    .map((skill) => normalizeSkill(skill))
    .filter(Boolean);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to view your skill gap analysis." },
      { status: 401 }
    );
  }

  try {
    const latestAssessment = await db.assessment.findFirst({
      where: {
        userId: Number(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const assessedSkills = new Set(
      parseSkills(latestAssessment?.strengths)
    );

    const careers = await db.career.findMany({
      orderBy: {
        title: "asc",
      },
    });

    const careerMatches = careers
      .map((career) => {
        const requiredSkills = (career.requiredSkills ?? "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        const matchedSkills = requiredSkills.filter(
          (skill) => assessedSkills.has(normalizeSkill(skill))
        );

        const missingSkills = requiredSkills.filter(
          (skill) => !assessedSkills.has(normalizeSkill(skill))
        );

        const matchPercentage =
          requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 0;

        return {
          id: career.id,
          title: career.title,
          category: career.category,
          description: career.description,
          salaryRange: career.salaryRange,
          matchPercentage,
          requiredSkills,
          matchedSkills,
          missingSkills,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const averageMatch =
      careerMatches.length > 0
        ? Math.round(
            careerMatches.reduce(
              (total, career) => total + career.matchPercentage,
              0
            ) / careerMatches.length
          )
        : 0;

    const topCareer = careerMatches[0] ?? null;
    const totalMissingSkills = careerMatches.reduce(
      (total, career) => total + career.missingSkills.length,
      0
    );

    return NextResponse.json({
      success: true,
      assessedSkills: Array.from(assessedSkills),
      summary: {
        totalCareers: careerMatches.length,
        averageMatch,
        totalMissingSkills,
        topCareer: topCareer
          ? {
              title: topCareer.title,
              matchPercentage: topCareer.matchPercentage,
              missingSkills: topCareer.missingSkills,
            }
          : null,
      },
      careerMatches,
    });
  } catch (error) {
    console.error("Skill gap analysis failed:", error);

    return NextResponse.json(
      { error: "Unable to load your skill gap analysis." },
      { status: 500 }
    );
  }
}
