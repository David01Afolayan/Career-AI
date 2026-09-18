import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

async function getStudent() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.student.findUnique({ where: { userId: Number(session.user.id) } });
}

export async function POST(request: Request, context: Context) {
  const student = await getStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resourceId = (await context.params).id;
  const body = await request.json();
  const rating = Number(body.rating);
  const resource = await db.learningResource.findUnique({ where: { id: resourceId } });
  if (!resource || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid resource or rating." }, { status: 400 });
  }
  const result = await db.resourceRating.upsert({
    where: { studentId_resourceId: { studentId: student.id, resourceId } },
    update: { rating },
    create: { studentId: student.id, resourceId, rating },
  });
  return NextResponse.json(result);
}

export async function PUT(request: Request, context: Context) {
  const student = await getStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resourceId = (await context.params).id;
  const resource = await db.learningResource.findUnique({ where: { id: resourceId } });
  if (!resource) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  const existing = await db.resourceBookmark.findUnique({ where: { studentId_resourceId: { studentId: student.id, resourceId } } });
  if (existing) await db.resourceBookmark.delete({ where: { id: existing.id } });
  else await db.resourceBookmark.create({ data: { studentId: student.id, resourceId } });
  return NextResponse.json({ bookmarked: !existing });
}
