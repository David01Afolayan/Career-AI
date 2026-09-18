import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: {
    id: string;
  };
};

async function requireAdminApi() {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== "ADMIN") {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();
    if ("response" in authResult) {
      return authResult.response;
    }

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        progress: {
          include: {
            resource: {
              select: {
                title: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Get student details error:", error);
    return NextResponse.json(
      { error: "Failed to load student details" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();
    if ("response" in authResult) {
      return authResult.response;
    }

    const { session } = authResult;

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only student accounts can be deleted from this endpoint." }, { status: 403 });
    }

    if (student.user.id === Number(session.user.id)) {
      return NextResponse.json({ error: "You cannot delete your own admin account from this page." }, { status: 403 });
    }

    await db.$transaction(async (tx) => {
      await tx.assessment.deleteMany({
        where: { userId: student.userId },
      });

      await tx.user.delete({
        where: { id: student.userId },
      });
    });

    return NextResponse.json({ message: "Student account deleted successfully." });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
