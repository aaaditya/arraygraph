"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getLessonBySlug } from "@/lib/content/loader";
import { kebabCase } from "@/lib/content/schemas";
import { db } from "@/lib/db";
import {
  type GuestCodeDraft,
  type GuestLessonProgress,
  type GuestProgressBlob,
  mergeGuestIntoServer,
} from "@/lib/progress/merge";
import { nextReviewDueAt } from "@/lib/progress/review";
import { applyActivityToStreak } from "@/lib/progress/streaks";
import { dateKeyInTimeZone, dateKeyToDbDate } from "./dates";
import { z } from "zod";

export type CompleteLessonResult =
  { ok: true; xpAwarded: number } | { ok: false; reason: "unauthenticated" | "not-found" };

const lessonProgressSaveSchema = z.object({
  lessonSlug: kebabCase,
  lastSection: z.string().trim().max(120).nullable().optional(),
  scrollPosition: z.number().int().min(0).max(1_000_000).optional(),
  visualizerState: z.unknown().optional(),
  quizState: z.unknown().optional(),
  updatedAt: z.string().datetime().optional(),
});

const codeDraftSchema = z.object({
  problemId: kebabCase,
  language: z.string().trim().min(1).max(32),
  code: z.string().max(200_000),
  updatedAt: z.string().datetime().optional(),
});

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function touchStreakAndDaily(
  tx: Prisma.TransactionClient,
  userId: string,
  timezone: string,
  xpDelta = 0,
) {
  const now = new Date();
  const day = dateKeyToDbDate(dateKeyInTimeZone(now, timezone));
  const streak = await tx.streak.findUnique({ where: { userId } });
  const next = applyActivityToStreak(
    streak ?? { current: 0, longest: 0, lastActiveDate: null },
    now,
    timezone,
  );
  await tx.streak.upsert({
    where: { userId },
    create: {
      userId,
      current: next.current,
      longest: next.longest,
      lastActiveDate: next.lastActiveDate,
    },
    update: {
      current: next.current,
      longest: next.longest,
      lastActiveDate: next.lastActiveDate,
    },
  });
  if (xpDelta > 0) {
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: { userId, date: day, xp: xpDelta },
      update: { xp: { increment: xpDelta } },
    });
  } else {
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: { userId, date: day },
      update: {},
    });
  }
}

export async function completeLessonAction(slug: string): Promise<CompleteLessonResult> {
  const userId = await requireUserId();
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
      create: {
        userId,
        lessonSlug: lesson.meta.slug,
        status: "COMPLETED",
        completedAt: now,
      },
      update: {
        status: "COMPLETED",
        completedAt: existing?.completedAt ?? now,
      },
    });
    const award = await tx.xpEvent.createMany({
      data: [{ userId, amount: xp, reason: "LESSON", refId: lesson.meta.slug }],
      skipDuplicates: true,
    });
    if (award.count === 0) {
      await touchStreakAndDaily(tx, userId, user.timezone, 0);
      return false;
    }
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: { userId, date: day, xp, lessonsCompleted: 1 },
      update: { xp: { increment: xp }, lessonsCompleted: { increment: 1 } },
    });
    await touchStreakAndDaily(tx, userId, user.timezone, 0);
    await tx.reviewItem.upsert({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType: "LESSON",
          itemId: lesson.meta.slug,
        },
      },
      create: {
        userId,
        itemType: "LESSON",
        itemId: lesson.meta.slug,
        stage: 0,
        dueAt: nextReviewDueAt(0, now),
      },
      update: {
        stage: 0,
        dueAt: nextReviewDueAt(0, now),
        lastReviewedAt: now,
      },
    });
    return true;
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return { ok: true, xpAwarded: awarded ? xp : 0 };
}

export async function saveLessonProgressAction(input: unknown) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, reason: "unauthenticated" as const };

  const parsed = lessonProgressSaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, reason: "invalid" as const };

  const lesson = await getLessonBySlug(parsed.data.lessonSlug);
  if (!lesson) return { ok: false as const, reason: "not-found" as const };

  const data = parsed.data;
  const visualizerState =
    data.visualizerState === undefined
      ? undefined
      : data.visualizerState === null
        ? Prisma.JsonNull
        : (data.visualizerState as Prisma.InputJsonValue);
  const quizState =
    data.quizState === undefined
      ? undefined
      : data.quizState === null
        ? Prisma.JsonNull
        : (data.quizState as Prisma.InputJsonValue);

  await db.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug: data.lessonSlug } },
    create: {
      userId,
      lessonSlug: data.lessonSlug,
      status: "IN_PROGRESS",
      lastSection: data.lastSection ?? null,
      scrollPosition: data.scrollPosition ?? 0,
      visualizerState,
      quizState,
    },
    update: {
      lastSection: data.lastSection === undefined ? undefined : data.lastSection,
      scrollPosition: data.scrollPosition,
      visualizerState,
      quizState,
    },
  });

  // Ensure status stays IN_PROGRESS only when not completed.
  await db.lessonProgress.updateMany({
    where: { userId, lessonSlug: data.lessonSlug, status: { not: "COMPLETED" } },
    data: { status: "IN_PROGRESS" },
  });

  return { ok: true as const };
}

export async function saveCodeDraftAction(input: unknown) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, reason: "unauthenticated" as const };
  const parsed = codeDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, reason: "invalid" as const };

  const { problemId, language, code } = parsed.data;
  await db.codeDraft.upsert({
    where: { userId_problemId_language: { userId, problemId, language } },
    create: { userId, problemId, language, code },
    update: { code },
  });
  return { ok: true as const };
}

export async function getResumeTargetAction() {
  const userId = await requireUserId();
  if (!userId) return null;
  const row = await db.lessonProgress.findFirst({
    where: { userId, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "desc" },
    select: { lessonSlug: true, lastSection: true },
  });
  if (!row) {
    const completed = await db.lessonProgress.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      select: { lessonSlug: true, lastSection: true },
    });
    return completed;
  }
  return row;
}

export async function exportProgressForMergeAction(): Promise<GuestProgressBlob | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const [lessons, drafts] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId } }),
    db.codeDraft.findMany({ where: { userId } }),
  ]);

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    lessons: lessons.map((row): GuestLessonProgress => ({
      lessonSlug: row.lessonSlug,
      status: row.status,
      lastSection: row.lastSection,
      scrollPosition: row.scrollPosition,
      visualizerState: row.visualizerState,
      quizState: row.quizState,
      completedAt: row.completedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    drafts: drafts.map((row): GuestCodeDraft => ({
      problemId: row.problemId,
      language: row.language,
      code: row.code,
      updatedAt: row.updatedAt.toISOString(),
    })),
  };
}

export async function mergeGuestProgressAction(guest: GuestProgressBlob) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, reason: "unauthenticated" as const };
  if (!guest || guest.version !== 1) return { ok: false as const, reason: "invalid" as const };

  const server = (await exportProgressForMergeAction()) ?? {
    version: 1 as const,
    lessons: [],
    drafts: [],
    savedAt: new Date(0).toISOString(),
  };
  const merged = mergeGuestIntoServer(server, guest);

  await db.$transaction(async (tx) => {
    for (const lesson of merged.lessons) {
      const existing = await tx.lessonProgress.findUnique({
        where: { userId_lessonSlug: { userId, lessonSlug: lesson.lessonSlug } },
      });
      const serverTs = existing?.updatedAt.getTime() ?? 0;
      const guestTs = new Date(lesson.updatedAt).getTime();
      if (existing && serverTs >= guestTs) continue;

      const visualizerState =
        lesson.visualizerState === undefined || lesson.visualizerState === null
          ? undefined
          : (lesson.visualizerState as Prisma.InputJsonValue);
      const quizState =
        lesson.quizState === undefined || lesson.quizState === null
          ? undefined
          : (lesson.quizState as Prisma.InputJsonValue);

      await tx.lessonProgress.upsert({
        where: { userId_lessonSlug: { userId, lessonSlug: lesson.lessonSlug } },
        create: {
          userId,
          lessonSlug: lesson.lessonSlug,
          status: lesson.status,
          lastSection: lesson.lastSection ?? null,
          scrollPosition: lesson.scrollPosition ?? 0,
          visualizerState,
          quizState,
          completedAt: lesson.completedAt ? new Date(lesson.completedAt) : null,
        },
        update: {
          status: lesson.status,
          lastSection: lesson.lastSection ?? null,
          scrollPosition: lesson.scrollPosition ?? 0,
          visualizerState,
          quizState,
          completedAt: lesson.completedAt ? new Date(lesson.completedAt) : null,
        },
      });
    }

    for (const draft of merged.drafts) {
      const existing = await tx.codeDraft.findUnique({
        where: {
          userId_problemId_language: {
            userId,
            problemId: draft.problemId,
            language: draft.language,
          },
        },
      });
      const serverTs = existing?.updatedAt.getTime() ?? 0;
      const guestTs = new Date(draft.updatedAt).getTime();
      if (existing && serverTs >= guestTs) continue;

      await tx.codeDraft.upsert({
        where: {
          userId_problemId_language: {
            userId,
            problemId: draft.problemId,
            language: draft.language,
          },
        },
        create: {
          userId,
          problemId: draft.problemId,
          language: draft.language,
          code: draft.code,
        },
        update: { code: draft.code },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return { ok: true as const, mergedCount: merged.lessons.length + merged.drafts.length };
}
