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
            progress: true,
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
    const assessments = await db.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { questionAnswers: true },
    });
    const latestAssessment = assessments[0];
    const assessment = latestAssessment
      ? {
          id: latestAssessment.id,
          score: latestAssessment.score,
          correctAnswers: latestAssessment.questionAnswers.filter(
            (answer) => answer.isCorrect
          ).length,
          totalQuestions: latestAssessment.questionAnswers.length,
          createdAt: latestAssessment.createdAt,
        }
      : null;

    const totalResources = student.progress.length;
    const completedResources = student.progress.filter(
      (item) => item.completionPercentage === 100
    ).length;
    const inProgressResources = student.progress.filter(
      (item) => item.completionPercentage > 0 && item.completionPercentage < 100
    ).length;
    const learningProgress = totalResources
      ? Math.round(
          student.progress.reduce(
            (total, item) => total + item.completionPercentage,
            0
          ) / totalResources
        )
      : 0;

    let nextAction = {
      title: "Complete Your Profile",
      description: "Complete your student profile to unlock better recommendations.",
      href: "/profile",
    };
    if (profileCompletion >= 70 && !latestAssessment) {
      nextAction = {
        title: "Take Your Technical Assessment",
        description: "Evaluate your technical skills to improve your career recommendation.",
        href: "/assessment",
      };
    } else if (latestAssessment) {
      nextAction = {
        title: "Get Your AI Career Recommendation",
        description: "Use your assessment results to discover suitable career paths.",
        href: "/ai-result",
      };
    }

    return NextResponse.json({
      user: { name: user.name, email: user.email, role: user.role },
      profile: {
        completion: profileCompletion,
        cgpa: student.cgpa,
        department: student.department,
        level: student.level,
        projects: student.projects,
        certifications: student.certifications,
      },
      skills: student.skills.map((item) => ({
        id: item.skill.id,
        name: item.skill.name,
        category: item.skill.category,
        proficiency: item.proficiencyLevel,
      })),
      assessment,
      career: null,
      learning: {
        progress: learningProgress,
        totalResources,
        completedResources,
        inProgressResources,
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
