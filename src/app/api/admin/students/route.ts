import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const students = await db.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Admin students error:", error);
    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 }
    );
  }
}
