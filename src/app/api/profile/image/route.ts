import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!session?.user?.id || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please select an image." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const profileImage = `data:${file.type};base64,${bytes.toString("base64")}`;
    await db.user.update({ where: { id: userId }, data: { profileImage } });
    return NextResponse.json({ profileImage });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json({ error: "Unable to upload profile image." }, { status: 500 });
  }
}
