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
      return NextResponse.json({ error: "Invalid career ID" }, { status: 400 });
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

    const career = await db.career.update({
      where: { id },
      data: { title, category, description, requiredSkills, salaryRange, demandLevel },
    });

    return NextResponse.json({ career });
  } catch (error) {
    console.error("Update career error:", error);
    return NextResponse.json({ error: "Failed to update career" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid career ID" }, { status: 400 });
    }

    const career = await db.career.findUnique({
      where: { id },
      include: { predictions: true },
    });
    if (!career) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }
    if (career.predictions.length > 0) {
      return NextResponse.json(
        { error: "This career has prediction history and cannot be deleted." },
        { status: 400 }
      );
    }

    await db.career.delete({ where: { id } });
    return NextResponse.json({ message: "Career deleted successfully." });
  } catch (error) {
    console.error("Delete career error:", error);
    return NextResponse.json({ error: "Failed to delete career" }, { status: 500 });
  }
}
