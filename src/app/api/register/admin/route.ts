import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { adminKeySchema, registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please correct the submitted fields." }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const bodyRecord = body as Record<string, unknown>;
    const parsedAdminKey = adminKeySchema.safeParse(bodyRecord.adminKey);
    if (!parsedAdminKey.success) {
      return NextResponse.json({ error: "Administrator key must be between 8 and 128 characters." }, { status: 400 });
    }
    const adminKeyFingerprint = createHash("sha256").update(parsedAdminKey.data).digest("hex");
    if (await db.user.findUnique({ where: { adminKeyFingerprint } })) {
      return NextResponse.json({ error: "That administrator key is already assigned to another account." }, { status: 400 });
    }
    if (await db.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Unable to create an account with these details." }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        adminKeyHash: await bcrypt.hash(parsedAdminKey.data, 12),
        adminKeyFingerprint,
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json({ error: "Unable to complete administrator registration right now." }, { status: 503 });
  }
}
