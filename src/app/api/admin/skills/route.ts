import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const skills = await db.skill.findMany({
      include: {
        _count: {
          select: { students: true, careers: true, learningResources: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills GET error:", error);
    return NextResponse.json({ error: "Failed to load skills." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Skill name and category are required." },
        { status: 400 }
      );
    }

    const existing = await db.skill.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "This skill already exists." }, { status: 409 });
    }

    const skill = await db.skill.create({ data: { name, category, description } });
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Skills POST error:", error);
    return NextResponse.json({ error: "Failed to create skill." }, { status: 500 });
  }
}
