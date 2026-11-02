import "server-only";

import { db } from "@/lib/db";
import { dateKeyInTimeZone, dateKeyToDbDate, shiftDateKey } from "@/lib/progress/dates";

export async function getDashboardData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { streak: true },
  });
  if (!user) return null;

  const todayKey = dateKeyInTimeZone(new Date(), user.timezone);
  const today = dateKeyToDbDate(todayKey);
  const weekAgo = dateKeyToDbDate(shiftDateKey(todayKey, -27));

  const [xp, completed, inProgress, todayActivity, recentActivity, dueReviews, resume] =
    await Promise.all([
      db.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
      db.lessonProgress.count({ where: { userId, status: "COMPLETED" } }),
      db.lessonProgress.count({ where: { userId, status: "IN_PROGRESS" } }),
      db.dailyActivity.findUnique({ where: { userId_date: { userId, date: today } } }),
      db.dailyActivity.findMany({
        where: { userId, date: { gte: weekAgo } },
        orderBy: { date: "asc" },
      }),
      db.reviewItem.findMany({
        where: { userId, dueAt: { lte: new Date() } },
        orderBy: { dueAt: "asc" },
        take: 8,
      }),
      db.lessonProgress.findFirst({
        where: { userId, status: "IN_PROGRESS" },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const calendar = Array.from({ length: 28 }, (_, index) => {
    const key = shiftDateKey(todayKey, index - 27);
    const row = recentActivity.find((day) => dateKeyInTimeZone(day.date, "UTC") === key);
    return { date: key, xp: row?.xp ?? 0 };
  });

  return {
    user,
    totalXp: xp._sum.amount ?? 0,
    completed,
    inProgress,
    todayXp: todayActivity?.xp ?? 0,
    dailyGoalXp: user.dailyGoalXp,
    streak: user.streak,
    calendar,
    dueReviews,
    resume,
  };
}
