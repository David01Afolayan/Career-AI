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

function getLearningStats(
  records: { status: string; updatedAt: Date }[],
  weeklyGoal: number
) {
  const completedResources = records.filter((record) => record.status === "COMPLETED").length;
  const inProgressResources = records.filter((record) => record.status === "IN_PROGRESS").length;
  const activeDates = new Set(
    records
      .filter((record) => record.status !== "NOT_STARTED")
      .map((record) => record.updatedAt.toISOString().slice(0, 10))
  );
  const today = new Date();
  let streak = 0;
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const todayKey = cursor.toISOString().slice(0, 10);
  const yesterday = new Date(cursor);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (!activeDates.has(todayKey) && !activeDates.has(yesterday.toISOString().slice(0, 10))) {
    streak = 0;
  } else {
    if (!activeDates.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (activeDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }
  const current = new Date();
  const weekStart = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()));
  weekStart.setUTCDate(current.getUTCDate() - current.getUTCDay());
  const weeklyCompletedResources = records.filter(
    (record) => record.status === "COMPLETED" && record.updatedAt >= weekStart
  ).length;
  return { currentStreak: streak, weeklyCompletedResources, weeklyGoal };
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
        ratings: { where: { studentId: student.id }, select: { rating: true } },
        bookmarks: { where: { studentId: student.id }, select: { id: true } },
      },
      orderBy: { title: "asc" },
    });
    const progressRecords = await db.progress.findMany({
      where: { studentId: student.id },
      select: { status: true, updatedAt: true },
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
        rating: resource.ratings[0]?.rating ?? 0,
        bookmarked: resource.bookmarks.length > 0,
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
      ...getLearningStats(progressRecords, student.weeklyLearningGoal),
    });
  } catch (error) {
    console.error("GET progress error:", error);
    return NextResponse.json({ error: "Failed to fetch learning progress" }, { status: 500 });
  }

}

export async function PUT(request: Request) {
  try {
    const student = await getStudent();
    if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    const body = await request.json();
    const weeklyLearningGoal = Number(body.weeklyLearningGoal);
    if (!Number.isInteger(weeklyLearningGoal) || weeklyLearningGoal < 1 || weeklyLearningGoal > 50) {
      return NextResponse.json({ error: "Weekly goal must be a whole number from 1 to 50" }, { status: 400 });
    }
    const updatedStudent = await db.student.update({
      where: { id: student.id },
      data: { weeklyLearningGoal },
      select: { weeklyLearningGoal: true },
    });
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PUT progress goal error:", error);
    return NextResponse.json({ error: "Failed to update weekly learning goal" }, { status: 500 });
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

    const previous = await db.progress.findUnique({
      where: { studentId_resourceId: { studentId: student.id, resourceId } },
    });
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
    if (previous?.status !== status) {
      const resource = await db.learningResource.findUnique({ where: { id: resourceId }, select: { title: true } });
      if (resource) {
        await db.notification.create({
          data: {
            studentId: student.id,
            title: status === "COMPLETED" ? "Learning milestone reached" : "Learning progress updated",
            message: status === "COMPLETED" ? `You completed ${resource.title}. Great work!` : `${resource.title} is now ${status === "IN_PROGRESS" ? "in progress" : "not started"}.`,
          },
        });
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("POST progress error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
