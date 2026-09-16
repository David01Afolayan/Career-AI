import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assessmentSubmitSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimit = await checkRateLimit(`assessment-submit:${userId}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many assessment submissions. Please wait before trying again." },
        { status: 429, headers: rateLimitResponse(rateLimit.resetAt) }
      );
    }

    const student = await db.student.findUnique({ where: { userId } });
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
    const parsed = assessmentSubmitSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid assessment submission." }, { status: 400 });
    const { answers } = parsed.data;

    const questionIds = answers.map((answer) => answer.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (uniqueQuestionIds.size !== questionIds.length) {
      return NextResponse.json({ error: "Duplicate assessment questions" }, { status: 400 });
    }

    const questions = await db.assessmentQuestion.findMany({
      where: { id: { in: questionIds } },
    });
    if (questions.length !== answers.length) {
      return NextResponse.json({ error: "Invalid assessment questions" }, { status: 400 });
    }

    const questionMap = new Map(questions.map((question) => [question.id, question]));
    let correctCount = 0;
    const skillResults = new Map<number, { correct: number; total: number }>();

    const evaluatedAnswers = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      const selectedAnswer = Number(answer.selectedAnswer);
      const isCorrect = Number.isInteger(selectedAnswer) && selectedAnswer === question?.correctAnswer;
      if (isCorrect) correctCount++;
      const result = skillResults.get(question!.skillId) ?? { correct: 0, total: 0 };
      result.total++;
      if (isCorrect) result.correct++;
      skillResults.set(question!.skillId, result);
      return { questionId: answer.questionId, selectedAnswer, isCorrect };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const assessment = await db.assessment.create({
      data: {
        userId,
        score,
        strengths: null,
        interests: null,
        recommendations: null,
        questionAnswers: { create: evaluatedAnswers },
      },
    });

    const skillLevels = await Promise.all(
      Array.from(skillResults.entries()).map(async ([skillId, result]) => {
        const percentage = (result.correct / result.total) * 100;
        const proficiencyLevel =
          percentage >= 80 ? 3 : percentage >= 60 ? 2 : percentage >= 40 ? 1 : 0;
        await db.studentSkill.upsert({
          where: { studentId_skillId: { studentId: student.id, skillId } },
          update: { proficiencyLevel },
          create: { studentId: student.id, skillId, proficiencyLevel },
        });
        return { skillId, proficiencyLevel };
      })
    );

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      score,
      correctCount,
      totalQuestions: questions.length,
      skillLevels,
    });
  } catch (error) {
    console.error("Assessment submission error:", error);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
