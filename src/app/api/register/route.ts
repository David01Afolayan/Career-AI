import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(`register:${getClientIp(request)}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: rateLimitResponse(rateLimit.resetAt) }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please correct the submitted fields.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, matricNumber, department, level } = parsed.data;
    if (await db.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Unable to create an account with these details." }, { status: 400 });
    }
    if (matricNumber && await db.student.findFirst({ where: { matricNumber } })) {
      return NextResponse.json({ error: "Unable to create an account with these details." }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "STUDENT",
        student: { create: { matricNumber: matricNumber || null, department: department || "Computer Science", level: level ?? 400 } },
      },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ success: true, message: "Account created successfully.", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Unable to complete registration right now." }, { status: 500 });
  }
}
