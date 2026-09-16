import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

const featureDefaults: Record<string, number> = {
  CGPA: 0,
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
  Projects: 0,
  Certifications: 0,
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const student = await db.student.findUnique({
      where: {
        userId: Number(session.user.id),
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const body: unknown = await request.json().catch(() => ({}));
    const input =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};

    const profile: Record<string, number | string> = {
      ...featureDefaults,
      Interest: typeof input.Interest === "string" ? input.Interest : "",
      Projects: student.projects,
      Certifications: student.certifications,
    };

    for (const feature of Object.keys(featureDefaults)) {
      const value = Number(input[feature]);

      if (Number.isFinite(value)) {
        profile[feature] = value;
      }
    }

    const response = await fetch(
      `${ML_API_URL.replace(/\/$/, "")}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
        cache: "no-store",
      }
    );

    const prediction = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("ML API error:", prediction);

      return NextResponse.json(
        { error: "The AI service could not process the prediction." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("ML prediction error:", error);

    return NextResponse.json(
      { error: "The AI service is unavailable." },
      { status: 503 }
    );
  }
}
