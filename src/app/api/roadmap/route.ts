import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseSkills(value: string | null) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((skill) => normalizeSkill(skill))
      .filter(Boolean)
  );
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: {
        userId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const assessment = await db.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Complete your assessment first." },
        { status: 400 }
      );
    }

    const assessedSkills = parseSkills(assessment.strengths);
    const careers = await db.career.findMany({
      orderBy: { title: "asc" },
    });

    const rankedCareers = careers
      .map((career) => {
        const requiredSkills = career.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
        const matchedSkills = requiredSkills.filter((skill) =>
          assessedSkills.has(normalizeSkill(skill))
        );

        return {
          career,
          requiredSkills,
          matchedSkills,
          matchPercentage: requiredSkills.length
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 0,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const selectedCareer = rankedCareers[0];

    if (!selectedCareer) {
      return NextResponse.json(
        { error: "No career paths are available yet." },
        { status: 404 }
      );
    }

    const currentLevel = Math.min(Math.max(assessment.score, 0), 100);
    const prioritySkills = selectedCareer.requiredSkills
      .map((skill, index) => {
        const hasSkill = assessedSkills.has(normalizeSkill(skill));
        const requiredLevel = 100;
        const skillLevel = hasSkill ? currentLevel : 0;

        return {
          skill,
          currentLevel: skillLevel,
          requiredLevel,
          gap: Math.max(requiredLevel - skillLevel, 0),
          importance: selectedCareer.requiredSkills.length - index,
        };
      })
      .filter((item) => item.gap > 0)
      .sort((a, b) => {
        if (b.importance !== a.importance) {
          return b.importance - a.importance;
        }

        return b.gap - a.gap;
      });

    const roadmap = await Promise.all(
      prioritySkills.map(async (prioritySkill) => {
        const skill = await db.skill.findUnique({
          where: { name: prioritySkill.skill },
        });

        const resources = skill
          ? await db.learningResource.findMany({
              where: { skillId: skill.id },
              orderBy: { title: "asc" },
            })
          : [];

        const resourcesWithProgress = await Promise.all(
          resources.map(async (resource) => {
            const progress = await db.progress.findUnique({
              where: {
                studentId_resourceId: {
                  studentId: student.id,
                  resourceId: resource.id,
                },
              },
            });

            return {
              ...resource,
              progressStatus: progress?.status ?? "NOT_STARTED",
              completionPercentage: progress?.completionPercentage ?? 0,
            };
          })
        );

        return {
          ...prioritySkill,
          skillId: skill?.id ?? null,
          resources: resourcesWithProgress,
          learningProgress: resourcesWithProgress.length
            ? Math.round(
                resourcesWithProgress.reduce(
                  (total, resource) => total + resource.completionPercentage,
                  0
                ) / resourcesWithProgress.length
              )
            : 0,
        };
      })
    );

    const learningResources = roadmap.flatMap((item) => item.resources);
    const overallLearningProgress = learningResources.length
      ? Math.round(
          learningResources.reduce(
            (total, resource) => total + resource.completionPercentage,
            0
          ) / learningResources.length
        )
      : 0;

    const completedSkills = selectedCareer.requiredSkills
      .map((skill) => ({
        skill,
        currentLevel: assessedSkills.has(normalizeSkill(skill))
          ? currentLevel
          : 0,
        requiredLevel: 100,
      }))
      .filter((item) => item.currentLevel >= item.requiredLevel);

    return NextResponse.json({
      career: {
        id: selectedCareer.career.id,
        name: selectedCareer.career.title,
      },
      roadmap,
      completedSkills,
      totalLearningAreas: roadmap.length,
      overallLearningProgress,
      learningSummary: {
        totalResources: learningResources.length,
        completedResources: learningResources.filter(
          (resource) => resource.progressStatus === "COMPLETED"
        ).length,
        inProgressResources: learningResources.filter(
          (resource) => resource.progressStatus === "IN_PROGRESS"
        ).length,
      },
    });
  } catch (error) {
    console.error("Roadmap error:", error);

    return NextResponse.json(
      { error: "Failed to generate learning roadmap." },
      { status: 500 }
    );
  }
}
