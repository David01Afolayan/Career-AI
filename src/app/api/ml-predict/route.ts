import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

const skillMap: Record<string, string> = {
  "HTML & CSS": "HTML_CSS",
  JavaScript: "JavaScript",
  React: "React",
  "Next.js": "NextJS",
  "Node.js": "NodeJS",
  Python: "Python",
  Java: "Java",
  "C++": "Cpp",
  SQL: "SQL",
  "Data Analysis": "Data_Analysis",
  "Machine Learning": "Machine_Learning",
  Networking: "Networking",
  Cybersecurity: "Cybersecurity",
  "Git & GitHub": "Git_GitHub",
  Communication: "Communication",
  "Problem Solving": "Problem_Solving",
};

export async function POST() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimit = await checkRateLimit(`ml-predict:${userId}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many AI recommendation requests. Please try again later." },
        { status: 429, headers: rateLimitResponse(rateLimit.resetAt) }
      );
    }

    const student = await db.student.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    if (
      !student.department ||
      student.level === null ||
      student.cgpa === null ||
      !student.interests ||
      student.skills.length < 3
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete your profile and add at least 3 skills before requesting an AI career recommendation.",
        },
        { status: 400 }
      );
    }

    const features: Record<string, number | string> = {
      CGPA: student.cgpa ?? 0,
      HTML_CSS: 0,
      JavaScript: 0,
      React: 0,
      NextJS: 0,
      NodeJS: 0,
      Python: 0,
      Java: 0,
      Cpp: 0,
      SQL: 0,
      Data_Analysis: 0,
      Machine_Learning: 0,
      Networking: 0,
      Cybersecurity: 0,
      Git_GitHub: 0,
      Communication: 0,
      Problem_Solving: 0,
      Projects: student.projects ?? 0,
      Certifications: student.certifications ?? 0,
      Interest: student.interests ?? "",
    };
    for (const studentSkill of student.skills) {
      const featureName = skillMap[studentSkill.skill.name];
      if (featureName) {
        features[featureName] = studentSkill.proficiencyLevel;
      }
    }

    const mlApiUrl = (process.env.ML_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let mlResponse: Response;
    try {
      mlResponse = await fetch(`${mlApiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const result = await mlResponse.json().catch(() => null);

    if (!mlResponse.ok) {
      console.error("ML service returned:", mlResponse.status, result);
      return NextResponse.json({ error: "The AI recommendation service is temporarily unavailable." }, { status: 503 });
    }

    const predictedCareerName =
      typeof result?.predictedCareer === "string"
        ? result.predictedCareer
        : typeof result?.predicted_career === "string"
          ? result.predicted_career
          : null;
    const career = predictedCareerName
      ? await db.career.findFirst({ where: { title: predictedCareerName } })
      : null;

    if (!career) {
      return NextResponse.json(
        { error: "The predicted career does not exist in the CareerAI database." },
        { status: 500 }
      );
    }

    const confidence = Number(result.confidence);
    const confidenceScore = Number.isFinite(confidence) ? confidence : 0;
    const confidencePercentage =
      confidenceScore <= 1 ? confidenceScore * 100 : confidenceScore;
    const prediction = await db.prediction.create({
      data: {
        studentId: student.id,
        careerId: career.id,
        confidenceScore,
      },
    });

    const predictionData = {
      predicted_career: career.title,
      predictedCareer: career.title,
      careerId: career.id,
      confidence: confidencePercentage,
      probabilities: result.probabilities || result.recommendations || {},
    };

    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      ...predictionData,
      prediction: predictionData,
    });
  } catch (error) {
    console.error("ML prediction error:", error);
    return NextResponse.json(
      { error: "Unable to generate AI career recommendation." },
      { status: 503 }
    );
  }
}
