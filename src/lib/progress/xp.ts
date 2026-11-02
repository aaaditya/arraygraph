import type { XpReason } from "@prisma/client";

/** Server-side XP amounts. Never trust the client for these numbers. */
export const XP = {
  LESSON_DEFAULT: 40,
  QUIZ: 15,
  PROBLEM_EASY: 20,
  PROBLEM_MEDIUM: 40,
  PROBLEM_HARD: 80,
  STREAK_BONUS: 10,
  REVIEW: 10,
} as const;

export function problemXp(difficulty: "easy" | "medium" | "hard" | string) {
  switch (difficulty) {
    case "easy":
      return XP.PROBLEM_EASY;
    case "hard":
      return XP.PROBLEM_HARD;
    default:
      return XP.PROBLEM_MEDIUM;
  }
}

export type AwardInput = {
  reason: XpReason;
  refId: string;
  amount: number;
};

export function lessonAward(slug: string, amount: number): AwardInput {
  return { reason: "LESSON", refId: slug, amount };
}

export function quizAward(quizId: string): AwardInput {
  return { reason: "QUIZ", refId: quizId, amount: XP.QUIZ };
}

export function streakBonusAward(dateKey: string): AwardInput {
  return { reason: "STREAK_BONUS", refId: `streak:${dateKey}`, amount: XP.STREAK_BONUS };
}
