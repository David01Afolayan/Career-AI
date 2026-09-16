import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resources = await db.learningResource.findMany({
      include: {
        skill: true,
        _count: { select: { progress: true } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("GET resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const skillId = Number(body.skillId);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const resourceType =
      typeof body.resourceType === "string" ? body.resourceType.trim() : "";
    const difficulty =
      typeof body.difficulty === "string" ? body.difficulty.trim() : "";

    if (!Number.isInteger(skillId) || !title || !url || !resourceType || !difficulty) {
      return NextResponse.json(
        { error: "Skill, title, URL, resource type, and difficulty are required" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Please provide a valid URL" }, { status: 400 });
    }

    const skill = await db.skill.findUnique({ where: { id: skillId } });
    if (!skill) {
      return NextResponse.json({ error: "Selected skill was not found" }, { status: 404 });
    }

    const resource = await db.learningResource.create({
      data: {
        id: randomUUID(),
        skillId,
        title,
        description,
        url,
        resourceType,
        difficulty,
      },
      include: { skill: true, _count: { select: { progress: true } } },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("POST resource error:", error);
    return NextResponse.json(
      { error: "Failed to create learning resource" },
      { status: 500 }
    );
  }
}
