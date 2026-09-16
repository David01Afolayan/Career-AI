import { createHash, randomUUID } from "crypto";
import { db } from "@/lib/db";

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

type RateLimitRow = { count: number; windowStart: Date };

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const hashedKey = hashKey(key);
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);
  const rows = await db.$queryRaw<RateLimitRow[]>`
    INSERT INTO "RateLimit" ("id", "key", "count", "windowStart", "updatedAt")
    VALUES (${randomUUID()}, ${hashedKey}, 1, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" <= ${cutoff}
        THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" <= ${cutoff}
        THEN ${now} ELSE "RateLimit"."windowStart" END,
      "updatedAt" = ${now}
    RETURNING "count", "windowStart"
  `;
  const row = rows[0];
  if (!row) {
    return { allowed: false, remaining: 0, resetAt: new Date(now.getTime() + windowMs) };
  }
  const resetAt = new Date(new Date(row.windowStart).getTime() + windowMs);
  return {
    allowed: row.count <= limit,
    remaining: Math.max(0, limit - row.count),
    resetAt,
  };
}

export function rateLimitResponse(resetAt: Date) {
  return {
    "Retry-After": String(
      Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000))
    ),
  };
}
