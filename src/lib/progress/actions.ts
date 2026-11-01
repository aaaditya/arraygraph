"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getLessonBySlug } from "@/lib/content/loader";
import { kebabCase } from "@/lib/content/schemas";
import { db } from "@/lib/db";
import { dateKeyInTimeZone, dateKeyToDbDate } from "./dates";

export type CompleteLessonResult =
  { ok: true; xpAwarded: number } | { ok: false; reason: "unauthenticated" | "not-found" };

export async function completeLessonAction(slug: string): Promise<CompleteLessonResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, reason: "unauthenticated" };

  const parsedSlug = kebabCase.safeParse(slug);
  if (!parsedSlug.success) return { ok: false, reason: "not-found" };
  const lesson = await getLessonBySlug(parsedSlug.data);
  if (!lesson || lesson.meta.status !== "ready") return { ok: false, reason: "not-found" };

  const user = await db.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  if (!user) return { ok: false, reason: "unauthenticated" };

  const now = new Date();
  const xp = lesson.meta.xp;
  const day = dateKeyToDbDate(dateKeyInTimeZone(now, user.timezone));

  const awarded = await db.$transaction(async (tx) => {
    const existing = await tx.lessonProgress.findUnique({
      where: { userId_lessonSlug: { userId, lessonSlug: lesson.meta.slug } },
      select: { completedAt: true },
    });
    await tx.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId, lessonSlug: lesson.meta.slug } },
      create: { userId, lessonSlug: lesson.meta.slug, status: "COMPLETED", completedAt: now },
      update: { status: "COMPLETED", completedAt: existing?.completedAt ?? now },
    });
    const award = await tx.xpEvent.createMany({
      data: [{ userId, amount: xp, reason: "LESSON", refId: lesson.meta.slug }],
      skipDuplicates: true,
    });
    if (award.count === 0) return false;
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: { userId, date: day, xp, lessonsCompleted: 1 },
      update: { xp: { increment: xp }, lessonsCompleted: { increment: 1 } },
    });
    return true;
  });

  revalidatePath("/profile");
  return { ok: true, xpAwarded: awarded ? xp : 0 };
}
