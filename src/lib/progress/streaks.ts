import { dateKeyInTimeZone, dateKeyToDbDate, shiftDateKey } from "./dates";

export type StreakSnapshot = {
  current: number;
  longest: number;
  lastActiveDate: Date | null;
};

/**
 * Pure streak update given the learner's timezone calendar day.
 * Activity on the same day is a no-op; yesterday extends; otherwise reset to 1.
 */
export function applyActivityToStreak(
  streak: StreakSnapshot,
  now: Date,
  timeZone: string,
): StreakSnapshot {
  const today = dateKeyInTimeZone(now, timeZone);
  const last = streak.lastActiveDate
    ? dateKeyInTimeZone(
        // Prisma @db.Date comes back as UTC midnight for that calendar day.
        streak.lastActiveDate,
        "UTC",
      )
    : null;

  if (last === today) {
    return streak;
  }

  const yesterday = shiftDateKey(today, -1);
  const current = last === yesterday ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: dateKeyToDbDate(today),
  };
}

export function isStreakAtRisk(streak: StreakSnapshot, now: Date, timeZone: string) {
  if (!streak.lastActiveDate || streak.current === 0) return false;
  const today = dateKeyInTimeZone(now, timeZone);
  const last = dateKeyInTimeZone(streak.lastActiveDate, "UTC");
  return last !== today && last === shiftDateKey(today, -1);
}
