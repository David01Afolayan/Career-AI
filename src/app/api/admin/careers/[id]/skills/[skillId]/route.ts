import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = { params: { id: string; skillId: string } };

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.careerSkill.delete({
      where: {
        careerId_skillId: {
          careerId: Number(params.id),
          skillId: Number(params.skillId),
        },
      },
    });

    return NextResponse.json({ message: "Skill removed from career." });
  } catch (error) {
    console.error("Remove career skill error:", error);
    return NextResponse.json({ error: "Failed to remove skill" }, { status: 500 });
  }
}
