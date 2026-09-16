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
    return { error: "Invalid question data." };
  }
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return { error: "Invalid correct answer." };
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

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const validation = validateQuestion(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    const skill = await db.skill.findUnique({ where: { id: validation.value.skillId } });
    if (!skill) return NextResponse.json({ error: "Selected skill does not exist." }, { status: 404 });

    const updated = await db.assessmentQuestion.update({
      where: { id },
      data: validation.value,
      include: { skill: { select: { id: true, name: true, category: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin question PUT error:", error);
    return NextResponse.json({ error: "Failed to update question." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const answerCount = await db.assessmentAnswer.count({ where: { questionId: id } });
    if (answerCount > 0) {
      return NextResponse.json(
        { error: "This question has already been used in an assessment and cannot be deleted." },
        { status: 409 }
      );
    }
    await db.assessmentQuestion.delete({ where: { id } });
    return NextResponse.json({ message: "Question deleted successfully." });
  } catch (error) {
    console.error("Admin question DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete question." }, { status: 500 });
  }
}
