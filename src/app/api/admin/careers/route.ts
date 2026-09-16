import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const careers = await db.career.findMany({
      include: {
        skills: {
          include: { skill: true },
          orderBy: { importance: "desc" },
        },
        _count: { select: { predictions: true } },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ careers });
  } catch (error) {
    console.error("Admin careers error:", error);
    return NextResponse.json({ error: "Failed to load careers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const requiredSkills =
      typeof body.requiredSkills === "string" ? body.requiredSkills.trim() : "";
    const salaryRange =
      typeof body.salaryRange === "string" ? body.salaryRange.trim() : null;
    const demandLevel =
      typeof body.demandLevel === "string" && body.demandLevel.trim()
        ? body.demandLevel.trim()
        : "Medium";

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, category, and description are required." },
        { status: 400 }
      );
    }

    const existing = await db.career.findFirst({ where: { title } });
    if (existing) {
      return NextResponse.json({ error: "A career with this title already exists." }, { status: 409 });
    }

    const career = await db.career.create({
      data: { title, category, description, requiredSkills, salaryRange, demandLevel },
    });

    return NextResponse.json({ career }, { status: 201 });
  } catch (error) {
    console.error("Create career error:", error);
    return NextResponse.json({ error: "Failed to create career" }, { status: 500 });
  }
}
