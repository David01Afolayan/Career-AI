import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const difficulties = new Set(["Beginner", "Intermediate", "Advanced"]);

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

function validateQuestion(body: Record<string, unknown>) {
  const skillId = Number(body.skillId);
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const options = Array.isArray(body.options)
    ? body.options.filter((option): option is string => typeof option === "string").map((option) => option.trim()).filter(Boolean)
    : [];
  const correctAnswer = Number(body.correctAnswer);
  const difficulty = typeof body.difficulty === "string" ? body.difficulty.trim() : "";

  if (!Number.isInteger(skillId) || skillId <= 0 || !question || options.length < 2 || options.length > 6 || !Number.isInteger(correctAnswer) || !difficulties.has(difficulty)) {
    return { error: "Please provide a skill, question, options, correct answer and difficulty." };
  }
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return { error: "Correct answer is outside the available options." };
  }

  return {
    value: {
      skillId,
      question,
      options,
      correctAnswer,
      explanation: typeof body.explanation === "string" && body.explanation.trim() ? body.explanation.trim() : null,
      difficulty,
    },
  };
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const questions = await db.assessmentQuestion.findMany({
      orderBy: { createdAt: "desc" },
      include: { skill: { select: { id: true, name: true, category: true } } },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Admin questions GET error:", error);
    return NextResponse.json({ error: "Failed to load assessment questions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const validation = validateQuestion(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });

    const skill = await db.skill.findUnique({ where: { id: validation.value.skillId } });
    if (!skill) return NextResponse.json({ error: "Selected skill does not exist." }, { status: 404 });

    const created = await db.assessmentQuestion.create({
      data: validation.value,
      include: { skill: { select: { id: true, name: true, category: true } } },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin question POST error:", error);
    return NextResponse.json({ error: "Failed to create assessment question." }, { status: 500 });
  }
}
