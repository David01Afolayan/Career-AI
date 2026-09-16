import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = { params: { id: string } };

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

async function readResourceInput(request: Request) {
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
    throw new Error("Skill, title, URL, resource type, and difficulty are required");
  }
  try {
    new URL(url);
  } catch {
    throw new Error("Please provide a valid URL");
  }
  return { skillId, title, description, url, resourceType, difficulty };
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = await readResourceInput(request);
    const existing = await db.learningResource.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Learning resource not found" }, { status: 404 });
    }
    const skill = await db.skill.findUnique({ where: { id: input.skillId } });
    if (!skill) {
      return NextResponse.json({ error: "Selected skill was not found" }, { status: 404 });
    }

    const resource = await db.learningResource.update({
      where: { id: params.id },
      data: input,
      include: { skill: true, _count: { select: { progress: true } } },
    });
    return NextResponse.json(resource);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update learning resource";
    if (
      message === "Skill, title, URL, resource type, and difficulty are required" ||
      message === "Please provide a valid URL"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("PUT resource error:", error);
    return NextResponse.json({ error: "Failed to update learning resource" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resource = await db.learningResource.findUnique({
      where: { id: params.id },
      include: { _count: { select: { progress: true } } },
    });
    if (!resource) {
      return NextResponse.json({ error: "Learning resource not found" }, { status: 404 });
    }
    if (resource._count.progress > 0) {
      return NextResponse.json(
        { error: "This resource cannot be deleted because students already have progress records for it." },
        { status: 400 }
      );
    }
    await db.learningResource.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Learning resource deleted successfully" });
  } catch (error) {
    console.error("DELETE resource error:", error);
    return NextResponse.json({ error: "Failed to delete learning resource" }, { status: 500 });
  }
}
