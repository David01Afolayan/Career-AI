import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeSkills(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object") {
    return {};
  }

  const entries = Object.entries(input as Record<string, unknown>);

  return entries.reduce<Record<string, number>>((acc, [key, value]) => {
    const numericValue = Number(value);

    if (key && Number.isFinite(numericValue)) {
      acc[key] = numericValue;
    }

    return acc;
  }, {});
}

function buildSummary(skills: Record<string, number>) {
  const entries = Object.entries(skills);

  if (entries.length === 0) {
    return {
      score: 0,
      strengths: "No skills assessed yet.",
      interests: "No interests captured yet.",
      recommendations: "Complete your assessment to get a personalized recommendation.",
    };
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const score = Math.round((total / entries.length) * 25);

  const strengths = entries
    .filter(([, value]) => value >= 2)
    .map(([name]) => name)
    .slice(0, 5);

  const growthAreas = entries
    .filter(([, value]) => value <= 1)
    .map(([name]) => name)
    .slice(0, 5);

  const recommendations = strengths.length
    ? `Your strongest capabilities suggest a path in ${strengths.join(", ")} and related technical roles. Focus on improving ${growthAreas.length ? growthAreas.join(", ") : "your current skills"} to become more competitive.`
    : "Your profile is still developing. Focus on building practical experience in core technical skills and continue the assessment as you grow.";

  return {
    score,
    strengths: strengths.length ? strengths.join(", ") : "No standout strengths identified yet.",
    interests: "Technology, problem solving, and professional growth.",
    recommendations,
  };
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const skills = normalizeSkills(body?.skills);

    if (Object.keys(skills).length === 0) {
      return NextResponse.json(
        { error: "No assessment answers were provided." },
        { status: 400 }
      );
    }

    const summary = buildSummary(skills);

    const assessment = await db.assessment.create({
      data: {
        userId: Number(session.user.id),
        score: summary.score,
        strengths: summary.strengths,
        interests: summary.interests,
        recommendations: summary.recommendations,
      },
    });

    return NextResponse.json({
      success: true,
      assessment,
      summary,
    });
  } catch (error) {
    console.error("Assessment submission failed:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving your assessment." },
      { status: 500 }
    );
  }
}
