import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSkillField } from "@/lib/skill-fields";

export const dynamic = "force-dynamic";

const QUESTIONS_PER_SKILL = 5;

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const skillIdParam = new URL(request.url).searchParams.get("skillId");
    const parsedSkillId = skillIdParam === null ? null : Number(skillIdParam);
    if (
      parsedSkillId !== null &&
      (!Number.isInteger(parsedSkillId) || parsedSkillId <= 0)
    ) {
      return NextResponse.json({ error: "Invalid skill selection." }, { status: 400 });
    }
    const skillId: number | null = parsedSkillId;

    const skills = (await db.skill.findMany({
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })).map((skill) => ({ ...skill, field: getSkillField(skill.name) }));

    if (skillId === null) {
      return NextResponse.json({ skills, questions: [], totalQuestions: 0 });
    }

    if (!skills.some((skill) => skill.id === skillId)) {
      return NextResponse.json({ error: "Selected skill was not found." }, { status: 404 });
    }

    const questions = await db.assessmentQuestion.findMany({
      where: { skillId },
      select: {
        id: true,
        question: true,
        options: true,
        difficulty: true,
        skill: { select: { id: true, name: true, category: true } },
      },
    });

    const beginner = shuffle(questions.filter((question) => question.difficulty === "Beginner"));
    const intermediate = shuffle(questions.filter((question) => question.difficulty === "Intermediate"));
    const advanced = shuffle(questions.filter((question) => question.difficulty === "Advanced"));
    const finalQuestions = shuffle(
      [...beginner, ...intermediate, ...advanced].slice(0, QUESTIONS_PER_SKILL)
    );

    return NextResponse.json({
      questions: finalQuestions,
      skills,
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
