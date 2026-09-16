import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await db.student.findUnique({
      where: {
        userId: Number(session.user.id),
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const progress = await db.progress.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        resource: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const totalResources =
      await db.learningResource.count();

    const completedResources =
      progress.filter(
        (item) =>
          item.status === "COMPLETED"
      ).length;

    const inProgressResources =
      progress.filter(
        (item) =>
          item.status === "IN_PROGRESS"
      ).length;

    const overallProgress =
      totalResources > 0
        ? Math.round(
            (completedResources /
              totalResources) *
              100
          )
        : 0;

    return NextResponse.json({
      progress,
      totalResources,
      completedResources,
      inProgressResources,
      overallProgress,
    });
  } catch (error) {
    console.error(
      "Progress GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load learning progress.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const resourceId = body.resourceId;
    const status = body.status;

    if (!resourceId || !status) {
      return NextResponse.json(
        {
          error:
            "Resource ID and status are required.",
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      "NOT_STARTED",
      "IN_PROGRESS",
      "COMPLETED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid progress status.",
        },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({
      where: {
        userId: Number(session.user.id),
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const completionPercentage =
      status === "COMPLETED"
        ? 100
        : status === "IN_PROGRESS"
          ? 50
          : 0;

    const progress =
      await db.progress.upsert({
        where: {
          studentId_resourceId: {
            studentId: student.id,
            resourceId,
          },
        },

        update: {
          status,
          completionPercentage,
          updatedAt: new Date(),
        },

        create: {
          studentId: student.id,
          resourceId,
          status,
          completionPercentage,
        },
      });

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error(
      "Progress POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update learning progress.",
      },
      { status: 500 }
    );
  }
}
