import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = { params: { id: string } };

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 });
    }
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    if (!name || !category) {
      return NextResponse.json({ error: "Skill name and category are required." }, { status: 400 });
    }
    const skill = await db.skill.update({
      where: { id },
      data: { name, category, description },
    });
    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Skill update error:", error);
    return NextResponse.json({ error: "Failed to update skill." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 });
    }
    const skill = await db.skill.findUnique({
      where: { id },
      include: { students: true, careers: true, learningResources: true },
    });
    if (!skill) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }
    if (skill.students.length || skill.careers.length || skill.learningResources.length) {
      return NextResponse.json(
        { error: "This skill is being used by the system and cannot be deleted." },
        { status: 400 }
      );
    }
    await db.skill.delete({ where: { id } });
    return NextResponse.json({ message: "Skill deleted successfully." });
  } catch (error) {
    console.error("Skill delete error:", error);
    return NextResponse.json({ error: "Failed to delete skill." }, { status: 500 });
  }
}
