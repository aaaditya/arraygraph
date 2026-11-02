import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { kebabCase } from "@/lib/content/schemas";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const slug = kebabCase.safeParse((await params).slug);
  if (!slug.success) return NextResponse.json({ error: "invalid slug" }, { status: 400 });

  const progress = await db.lessonProgress.findUnique({
    where: { userId_lessonSlug: { userId: session.user.id, lessonSlug: slug.data } },
    select: { status: true, completedAt: true },
  });
  return NextResponse.json({
    completed: progress?.status === "COMPLETED",
    completedAt: progress?.completedAt ?? null,
  });
}
