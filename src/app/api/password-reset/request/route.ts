import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

const genericResponse = {
  message: "If an account exists for that email, a password reset link has been created.",
};

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`password-reset:${getClientIp(request)}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, {
      status: 429,
      headers: rateLimitResponse(rateLimit.resetAt),
    });
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return NextResponse.json(genericResponse);

    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json(genericResponse);

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        tokenHash: createHash("sha256").update(token).digest("hex"),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${token}`;
    console.info("Password reset URL (configure email delivery before production):", resetUrl);
    return NextResponse.json({
      ...genericResponse,
      ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Unable to process the request right now." }, { status: 503 });
  }
}
