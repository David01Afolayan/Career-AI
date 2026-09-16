import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

const featureNames = [
  "HTML_CSS",
  "JavaScript",
  "React",
  "NextJS",
  "NodeJS",
  "Python",
  "Java",
  "Cpp",
  "SQL",
  "Data_Analysis",
  "Machine_Learning",
  "Networking",
  "Cybersecurity",
  "Git_GitHub",
  "Communication",
  "Problem_Solving",
] as const;

export async function POST() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const features: Record<string, number> = {
      CGPA: student.cgpa,
      Projects: student.projects,
      Certifications: student.certifications,
    };
    for (const featureName of featureNames) features[featureName] = 0;
    for (const studentSkill of student.skills) {
      const feature = skillMap[studentSkill.skill.name];
      if (feature) features[feature] = studentSkill.proficiencyLevel;
    }

    const mlApiUrl = (process.env.ML_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    const mlResponse = await fetch(`${mlApiUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...features, Interest: student.interests }),
      cache: "no-store",
    });
    const result = await mlResponse.json().catch(() => null);

    if (!mlResponse.ok) {
      console.error("ML service error:", result);
      return NextResponse.json(
        { error: result?.detail || result?.error || "The ML service could not generate a recommendation." },
        { status: 503 }
      );
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
