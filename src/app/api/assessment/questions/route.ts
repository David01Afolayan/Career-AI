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

    const questions = await db.assessmentQuestion.findMany({
      select: {
        id: true,
        question: true,
        options: true,
        difficulty: true,
        skill: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Assessment questions error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment questions" },
      { status: 500 }
    );
  }
}
