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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalStudents,
      totalCareers,
      totalSkills,
      totalResources,
      totalAssessments,
      totalPredictions,
      predictions,
    ] = await Promise.all([
      db.student.count(),
      db.career.count(),
      db.skill.count(),
      db.learningResource.count(),
      db.assessment.count(),
      db.prediction.count(),
      db.prediction.findMany({ include: { career: true } }),
    ]);

    const careerCounts: Record<string, number> = {};
    predictions.forEach((prediction) => {
      const careerName = prediction.career.title;
      careerCounts[careerName] = (careerCounts[careerName] || 0) + 1;
    });

    return NextResponse.json({
      statistics: {
        totalStudents,
        totalCareers,
        totalSkills,
        totalResources,
        totalAssessments,
        totalPredictions,
        careerDistribution: Object.entries(careerCounts).map(
          ([career, count]) => ({ career, count })
        ),
      },
    });
  } catch (error) {
    console.error("Admin statistics error:", error);
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
