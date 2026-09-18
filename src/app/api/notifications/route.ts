import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const student = await db.student.findUnique({ where: { userId: Number(session.user.id) } });
  if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  const notifications = await db.notification.findMany({ where: { studentId: student.id }, orderBy: { createdAt: "desc" }, take: 10 });
  return NextResponse.json({ notifications, unread: notifications.filter((item) => !item.readAt).length });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const student = await db.student.findUnique({ where: { userId: Number(session.user.id) } });
  if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  await db.notification.updateMany({ where: { studentId: student.id, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ success: true });
}
