import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            skills: { include: { skill: true } },
            predictions: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: { career: true },
            },
          },
        },
      },
    });

    if (!user?.student) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    const student = user.student;
    const assessments = await db.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const progressRecords = await db.progress.findMany({
      where: { studentId: student.id },
      include: { resource: true },
    });

    const profileChecks = [
      Boolean(user.name),
      Boolean(student.matricNumber),
      Boolean(student.department),
      student.level !== null,
      student.cgpa !== null,
      Boolean(student.interests),
      Boolean(student.experience),
      student.projects > 0,
      student.certifications > 0,
      student.skills.length >= 3,
    ];
    const profileCompletion = Math.round(
      (profileChecks.filter(Boolean).length / profileChecks.length) * 100
    );

    const assessmentScores = assessments
      .map((assessment) => ({
        id: assessment.id,
        score: assessment.score,
        date: assessment.createdAt.toISOString().split("T")[0],
      }))
      .reverse();
    const latestAssessment = assessments[0] ?? null;
    const averageAssessmentScore = assessments.length
      ? Math.round(
          assessments.reduce((sum, assessment) => sum + assessment.score, 0) /
            assessments.length
        )
      : 0;

    const skills = student.skills
      .map((studentSkill) => ({
        skill: studentSkill.skill.name,
        level: studentSkill.proficiencyLevel,
        category: studentSkill.skill.category,
      }))
      .sort((a, b) => b.level - a.level);
    const strongestSkills = skills.filter((skill) => skill.level >= 2).slice(0, 5);
    const improvementSkills = skills.filter((skill) => skill.level < 2).slice(0, 5);

    const totalResources = progressRecords.length;
    const completedResources = progressRecords.filter(
      (item) => item.status === "COMPLETED"
    ).length;
    const inProgressResources = progressRecords.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;
    const learningProgress = totalResources
      ? Math.round(
          progressRecords.reduce(
            (sum, item) => sum + item.completionPercentage,
            0
          ) / totalResources
        )
      : 0;

    const careerHistory = student.predictions.map((prediction) => ({
      id: prediction.id,
      career: prediction.career.title,
      confidence: Math.round(
        prediction.confidenceScore <= 1
          ? prediction.confidenceScore * 100
          : prediction.confidenceScore
      ),
      careerId: prediction.careerId,
      date: prediction.createdAt.toISOString().split("T")[0],
    }));
    const latestPrediction = careerHistory[0] ?? null;

    let nextAction = {
      title: "Complete your profile",
      description: "Add your academic information, interests and skills.",
      href: "/profile",
    };
    if (profileCompletion >= 70 && !latestAssessment) {
      nextAction = {
        title: "Take the career assessment",
        description: "Measure your current technical skill levels.",
        href: "/assessment",
      };
    } else if (profileCompletion >= 70 && latestAssessment && !latestPrediction) {
      nextAction = {
        title: "Get your AI career recommendation",
        description: "Use your profile and assessment results to discover suitable career paths.",
        href: "/ai-result",
      };
    } else if (latestPrediction && learningProgress < 100) {
      nextAction = {
        title: "Continue your learning roadmap",
        description: "Work on the skills required for your recommended career.",
        href: "/roadmap",
      };
    }

    return NextResponse.json({
      user: { name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
      profileCompletion,
      latestAssessment: latestAssessment
        ? {
            score: latestAssessment.score,
            date: latestAssessment.createdAt.toISOString().split("T")[0],
          }
        : null,
      assessmentStats: {
        total: assessments.length,
        averageScore: averageAssessmentScore,
        latestScore: latestAssessment?.score ?? null,
      },
      assessmentScores,
      latestPrediction,
      careerHistory,
      skills,
      strongestSkills,
      improvementSkills,
      learning: {
        totalResources,
        completedResources,
        inProgressResources,
        progress: learningProgress,
      },
      nextAction,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard." },
      { status: 500 }
    );
  }
}
