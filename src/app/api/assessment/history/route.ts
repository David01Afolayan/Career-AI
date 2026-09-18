import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSkillField } from "@/lib/skill-fields";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessments = await db.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        questionAnswers: {
          include: {
            question: {
              include: { skill: true },
            },
          },
        },
      },
    });

    const history = assessments.map((assessment) => {
      const totalQuestions = assessment.questionAnswers.length;
      const correctCount = assessment.questionAnswers.filter(
        (answer) => answer.isCorrect
      ).length;
      const skillMap = new Map<
        number,
        { skillName: string; total: number; correct: number }
      >();

      for (const answer of assessment.questionAnswers) {
        const skill = answer.question.skill;
        const current = skillMap.get(skill.id) ?? {
          skillName: skill.name,
          total: 0,
          correct: 0,
        };
        current.total++;
        if (answer.isCorrect) current.correct++;
        skillMap.set(skill.id, current);
      }

      return {
        id: assessment.id,
        score: Math.round(assessment.score),
        correctCount,
        totalQuestions,
        skills: Array.from(skillMap.values()).map((skill) => ({
          skillName: skill.skillName,
          percentage: skill.total
            ? Math.round((skill.correct / skill.total) * 100)
            : 0,
        })),
        assessedField: (() => {
          const fields = Array.from(skillMap.values()).map((skill) => getSkillField(skill.skillName));
          return new Set(fields).size === 1 ? fields[0] : null;
        })(),
        createdAt: assessment.createdAt,
      };
    });

    const trend = [...history]
      .reverse()
      .map((assessment, index) => ({
        attempt: index + 1,
        assessmentId: assessment.id,
        score: assessment.score,
        date: assessment.createdAt,
      }));
    const scores = history.map((assessment) => assessment.score);
    const latestScore = scores[0] ?? null;
    const previousScore = scores[1] ?? null;
    const firstScore = scores[scores.length - 1] ?? null;
    const bestScore = scores.length ? Math.max(...scores) : null;

    return NextResponse.json({
      assessments: history,
      analytics: {
        totalAttempts: history.length,
        latestScore,
        previousScore,
        scoreChange: latestScore !== null && previousScore !== null ? latestScore - previousScore : null,
        overallChange: latestScore !== null && firstScore !== null ? latestScore - firstScore : null,
        bestScore,
        averageScore: scores.length
          ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
          : null,
        trend,
      },
    });
  } catch (error) {
    console.error("Assessment history error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment history." },
      { status: 500 }
    );
  }
}
