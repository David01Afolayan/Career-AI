import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const QUESTIONS_PER_SKILL = 2;

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
      const beginner = shuffle(
        skillQuestions.filter((question) => question.difficulty === "Beginner")
      );
      const intermediate = shuffle(
        skillQuestions.filter(
          (question) => question.difficulty === "Intermediate"
        )
      );
      const advanced = shuffle(
        skillQuestions.filter((question) => question.difficulty === "Advanced")
      );

      const firstQuestion =
        beginner[0] ?? intermediate[0] ?? advanced[0];
      const secondQuestion =
        intermediate.find(
          (question) => question.id !== firstQuestion?.id
        ) ??
        advanced.find((question) => question.id !== firstQuestion?.id) ??
        beginner.find((question) => question.id !== firstQuestion?.id);

      if (firstQuestion) selectedQuestions.push(firstQuestion);
      if (secondQuestion) selectedQuestions.push(secondQuestion);
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
