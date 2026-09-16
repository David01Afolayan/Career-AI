import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getStudent() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.student.findUnique({
    where: { userId: Number(session.user.id) },
  });
}

export async function GET() {
  try {
    const student = await getStudent();
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const resources = await db.learningResource.findMany({
      include: {
        skill: true,
        progress: {
          where: { studentId: student.id },
        },
      },
      orderBy: { title: "asc" },
    });

    const formattedResources = resources.map((resource) => {
      const progressRecord = resource.progress[0];
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        resourceType: resource.resourceType,
        difficulty: resource.difficulty,
        skill: resource.skill,
        status: progressRecord?.status || "NOT_STARTED",
        completionPercentage: progressRecord?.completionPercentage || 0,
      };
    });

    const totalResources = formattedResources.length;
    const completedResources = formattedResources.filter(
      (resource) => resource.status === "COMPLETED"
    ).length;
    const inProgressResources = formattedResources.filter(
      (resource) => resource.status === "IN_PROGRESS"
    ).length;
    const overallProgress =
      totalResources > 0
        ? Math.round(
            formattedResources.reduce(
              (total, resource) => total + resource.completionPercentage,
              0
            ) / totalResources
          )
        : 0;

    return NextResponse.json({
      resources: formattedResources,
      totalResources,
      completedResources,
      inProgressResources,
      overallProgress,
    });
  } catch (error) {
    console.error("GET progress error:", error);
    return NextResponse.json({ error: "Failed to fetch learning progress" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const student = await getStudent();
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const resourceId = typeof body.resourceId === "string" ? body.resourceId : "";
    const status = body.status;
    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

    if (!resourceId || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid resource or progress status" }, { status: 400 });
    }

    const resource = await db.learningResource.findUnique({ where: { id: resourceId } });
    if (!resource) {
      return NextResponse.json({ error: "Learning resource not found" }, { status: 404 });
    }

    let percentage = Number(body.completionPercentage);
    if (status === "NOT_STARTED") percentage = 0;
    if (status === "IN_PROGRESS") {
      percentage = Number.isFinite(percentage)
        ? Math.max(1, Math.min(99, percentage))
        : 50;
    }
    if (status === "COMPLETED") percentage = 100;

    const progress = await db.progress.upsert({
      where: {
        studentId_resourceId: { studentId: student.id, resourceId },
      },
      update: { status, completionPercentage: percentage },
      create: {
        studentId: student.id,
        resourceId,
        status,
        completionPercentage: percentage,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("POST progress error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
