import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSkillField } from "@/lib/skill-fields";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessmentId = Number((await context.params).id);
    if (!Number.isInteger(assessmentId)) {
      return NextResponse.json({ error: "Invalid assessment ID." }, { status: 400 });
    }

    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId },
      include: {
        questionAnswers: {
          include: { question: { include: { skill: true } } },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    }

    const skillMap = new Map<number, { skillId: number; skillName: string; total: number; correct: number }>();
    for (const answer of assessment.questionAnswers) {
      const skill = answer.question.skill;
      const current = skillMap.get(skill.id) ?? { skillId: skill.id, skillName: skill.name, total: 0, correct: 0 };
      current.total++;
      if (answer.isCorrect) current.correct++;
      skillMap.set(skill.id, current);
    }

    const skills = Array.from(skillMap.values()).map((skill) => {
      const percentage = skill.total ? Math.round((skill.correct / skill.total) * 100) : 0;
      const proficiency = percentage >= 80 ? "Professional" : percentage >= 60 ? "Advance" : percentage >= 40 ? "Intermediate" : "Beginner";
      return { ...skill, field: getSkillField(skill.skillName), percentage, proficiency };
    }).sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      assessmentId: assessment.id,
      score: assessment.score,
      correctCount: assessment.questionAnswers.filter((answer) => answer.isCorrect).length,
      totalQuestions: assessment.questionAnswers.length,
      skills,
      createdAt: assessment.createdAt,
    });
  } catch (error) {
    console.error("Assessment result error:", error);
    return NextResponse.json({ error: "Failed to load assessment result." }, { status: 500 });
  }
}
