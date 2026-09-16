import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = { params: { id: string } };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const careerId = Number(params.id);
    const body = await request.json();
    const skillId = Number(body.skillId);
    const requiredLevel = Number(body.requiredLevel);
    const importance = Number(body.importance);

    if (!Number.isInteger(careerId) || !Number.isInteger(skillId)) {
      return NextResponse.json({ error: "Valid career and skill are required." }, { status: 400 });
    }
    if (!Number.isFinite(requiredLevel) || !Number.isFinite(importance)) {
      return NextResponse.json({ error: "Required level and importance must be numbers." }, { status: 400 });
    }

    const careerSkill = await db.careerSkill.upsert({
      where: { careerId_skillId: { careerId, skillId } },
      update: { requiredLevel, importance },
      create: { careerId, skillId, requiredLevel, importance },
      include: { skill: true },
    });

    return NextResponse.json({ careerSkill });
  } catch (error) {
    console.error("Save career skill error:", error);
    return NextResponse.json({ error: "Failed to save career skill" }, { status: 500 });
  }
}
