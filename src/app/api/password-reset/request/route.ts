import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";
import { isEmailDeliveryConfigured, sendPasswordResetEmail } from "@/lib/email";

const genericResponse = {
  message: "If an account exists for that email, a password reset link has been created.",
};

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(`password-reset:${getClientIp(request)}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, {
        status: 429,
        headers: rateLimitResponse(rateLimit.resetAt),
      });
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const adminReset = body.admin === true;
    if (!email) return NextResponse.json(genericResponse);

    const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) return NextResponse.json(genericResponse);
    if (adminReset && user.role !== "ADMIN") return NextResponse.json(genericResponse);

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        tokenHash: createHash("sha256").update(token).digest("hex"),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const resetPath = adminReset ? "/reset-password/admin" : "/reset-password";
    const resetUrl = `${appUrl.replace(/\/$/, "")}${resetPath}?token=${token}`;
    if (!isEmailDeliveryConfigured()) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("SMTP is not configured; returning a development-only password reset URL.");
        return NextResponse.json({ ...genericResponse, resetUrl });
      }
      throw new Error("SMTP email delivery is not configured.");
    }

    await sendPasswordResetEmail(email, resetUrl);
    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Unable to process the request right now." }, { status: 503 });
  }
}
