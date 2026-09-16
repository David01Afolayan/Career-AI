import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const careerId = Number((await context.params).id);
    if (!Number.isInteger(careerId)) {
      return NextResponse.json({ error: "Invalid career ID" }, { status: 400 });
    }

    const career = await db.career.findUnique({
      where: { id: careerId },
      include: {
        skills: {
          include: { skill: { include: { learningResources: true } } },
          orderBy: { importance: "desc" },
        },
      },
    });

    if (!career) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    const student = await db.student.findUnique({
      where: { userId: Number(session.user.id) },
      include: { skills: true },
    });
    const studentSkillIds = new Set(student?.skills.map((item) => item.skillId));

    const skills = career.skills.map((careerSkill) => {
      const currentLevel = studentSkillIds.has(careerSkill.skillId) ? 1 : 0;
      const gap = Math.max(careerSkill.requiredLevel - currentLevel, 0);
      const status =
        gap >= 2 ? "High Priority" : gap === 1 ? "Needs Improvement" : "Completed";

      return {
        skillId: careerSkill.skillId,
        name: careerSkill.skill.name,
        category: careerSkill.skill.category,
        requiredLevel: careerSkill.requiredLevel,
        currentLevel,
        importance: careerSkill.importance,
        gap,
        status,
        resources: careerSkill.skill.learningResources,
      };
    });

    const totalWeight = skills.reduce((sum, skill) => sum + skill.importance, 0);
    const weightedScore = skills.reduce(
      (sum, skill) =>
        sum +
        (skill.requiredLevel > 0
          ? Math.min(skill.currentLevel / skill.requiredLevel, 1)
          : 1) *
          skill.importance,
      0
    );

    return NextResponse.json({
      career: {
        id: career.id,
        name: career.title,
        description: career.description,
        demandLevel: career.demandLevel,
      },
      readiness: totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0,
      skills,
    });
  } catch (error) {
    console.error("Career details error:", error);
    return NextResponse.json({ error: "Failed to load career details" }, { status: 500 });
  }
}
