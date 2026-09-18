import nodemailer from "nodemailer";

function getMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass || !Number.isFinite(port)) {
    throw new Error("SMTP email delivery is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export function isEmailDeliveryConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      (process.env.SMTP_PORT || "587"),
  );
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("SMTP_FROM or SMTP_USER must be configured.");

  await getMailTransport().sendMail({
    from,
    to: email,
    subject: "Reset your CareerAI password",
    text: `Use this link to reset your CareerAI password. It expires in one hour:\n\n${resetUrl}`,
    html: `
      <p>We received a request to reset your CareerAI password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in one hour. If you did not request this, you can ignore this email.</p>
    `,
  });
}
