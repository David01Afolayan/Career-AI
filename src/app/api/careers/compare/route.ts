import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").map(Number).filter(Number.isInteger) ?? [];
  if (ids.length < 2 || ids.length > 4) return NextResponse.json({ error: "Choose between 2 and 4 careers." }, { status: 400 });

  const careers = await db.career.findMany({
    where: { id: { in: ids } },
    include: { skills: { include: { skill: true } } },
  });
  const student = await db.student.findUnique({
    where: { userId: Number(session.user.id) },
    include: { skills: true },
  });
  const levels = new Map((student?.skills ?? []).map((skill) => [skill.skillId, skill.proficiencyLevel]));
  const result = careers.map((career) => {
    const skills = career.skills.map((item) => ({
      name: item.skill.name,
      requiredLevel: item.requiredLevel,
      currentLevel: levels.get(item.skillId) ?? 0,
      importance: item.importance,
    }));
    const weight = skills.reduce((sum, item) => sum + item.importance, 0);
    const readiness = weight ? Math.round(skills.reduce((sum, item) => sum + Math.min(item.currentLevel / Math.max(item.requiredLevel, 1), 1) * item.importance, 0) / weight * 100) : 0;
    return { id: career.id, title: career.title, category: career.category, description: career.description, demandLevel: career.demandLevel, salaryRange: career.salaryRange, readiness, skills };
  });
  return NextResponse.json({ careers: result });
}
