import { createHash } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!token || password.length < 8) {
      return NextResponse.json({ error: "Use a valid reset link and a password of at least 8 characters." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const resetToken = await db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
      db.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json({ error: "Unable to reset your password right now." }, { status: 503 });
  }
}
