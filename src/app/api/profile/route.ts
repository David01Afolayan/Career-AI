import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

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

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let student = await db.student.findUnique({
      where: { userId },
      include: { skills: true },
    });
    if (!student) {
      student = await db.student.create({
        data: { userId },
        include: { skills: true },
      });
    }
    const skills = await db.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    const assessedSkillRows = await db.assessmentAnswer.findMany({
      where: { assessment: { userId } },
      select: { question: { select: { skillId: true } } },
      distinct: ["questionId"],
    });

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        cgpa: student.cgpa,
        interests: student.interests,
        experience: student.experience,
        projects: student.projects,
        certifications: student.certifications,
        skills: student.skills,
      },
      skills,
      assessedSkillIds: Array.from(
        new Set(assessedSkillRows.map((row) => row.question.skillId))
      ),
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`profile:${session.user.id}`, 30, 10 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ error: "Too many profile updates. Please try again later." }, { status: 429, headers: rateLimitResponse(rateLimit.resetAt) });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Please correct the submitted profile information.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const data = parsed.data;

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: { id: userId },
        data: { name: data.name },
      });

      const student = await transaction.student.upsert({
        where: { userId },
        create: {
          userId,
          matricNumber: data.matricNumber,
          department: data.department,
          level: data.level,
          cgpa: data.cgpa,
          interests: data.interests,
          experience: data.experience,
          projects: data.projects ?? 0,
          certifications: data.certifications ?? 0,
        },
        update: {
          matricNumber: data.matricNumber,
          department: data.department,
          level: data.level,
          cgpa: data.cgpa,
          interests: data.interests,
          experience: data.experience,
          projects: data.projects ?? 0,
          certifications: data.certifications ?? 0,
        },
      });

      const skillIds = data.skills.map((skill) => skill.skillId);
      const existingSkills = await transaction.skill.findMany({
        where: { id: { in: skillIds } },
        select: { id: true },
      });
      if (existingSkills.length !== skillIds.length) {
        throw new Error("One or more selected skills do not exist.");
      }

      await transaction.studentSkill.deleteMany({ where: { studentId: student.id } });
      if (data.skills.length > 0) {
        await transaction.studentSkill.createMany({
          data: data.skills.map((skill) => ({
            studentId: student.id,
            skillId: skill.skillId,
            proficiencyLevel: skill.proficiencyLevel,
          })),
        });
      }

      return { user, student };
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      profile: {
        name: result.user.name,
        email: result.user.email,
        matricNumber: result.student.matricNumber,
        department: result.student.department,
        level: result.student.level,
        cgpa: result.student.cgpa,
        interests: result.student.interests,
        experience: result.student.experience,
        projects: result.student.projects,
        certifications: result.student.certifications,
        skills: data.skills,
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
