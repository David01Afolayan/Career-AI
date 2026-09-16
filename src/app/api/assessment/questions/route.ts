import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const QUESTIONS_PER_SKILL = 2;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questions = await db.assessmentQuestion.findMany({
      select: {
        id: true,
        question: true,
        options: true,
        difficulty: true,
        skill: { select: { id: true, name: true, category: true } },
      },
    });

    const questionsBySkill = new Map<number, typeof questions>();
    for (const question of questions) {
      const skillId = question.skill.id;
      if (!questionsBySkill.has(skillId)) {
        questionsBySkill.set(skillId, []);
      }
      questionsBySkill.get(skillId)!.push(question);
    }

    const selectedQuestions: typeof questions = [];
    for (const skillQuestions of questionsBySkill.values()) {
      const shuffled = [...skillQuestions].sort(() => Math.random() - 0.5);
      const difficultyPool = [
        ...shuffled.filter((question) => question.difficulty === "Beginner"),
        ...shuffled.filter((question) => question.difficulty === "Intermediate"),
        ...shuffled.filter((question) => question.difficulty === "Advanced"),
      ];
      selectedQuestions.push(
        ...difficultyPool.slice(0, QUESTIONS_PER_SKILL)
      );
    }

    const finalQuestions = selectedQuestions.sort(
      () => Math.random() - 0.5
    );

    return NextResponse.json({
      questions: finalQuestions,
      totalQuestions: finalQuestions.length,
      questionsPerSkill: QUESTIONS_PER_SKILL,
    });
  } catch (error) {
    console.error("Assessment questions error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment questions" },
      { status: 500 }
    );
  }
}
