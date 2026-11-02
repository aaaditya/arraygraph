/** Spaced-repetition intervals in days for stages 0..3. */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 21] as const;

export function nextReviewDueAt(stage: number, from = new Date()): Date {
  const clamped = Math.min(Math.max(stage, 0), REVIEW_INTERVAL_DAYS.length - 1);
  const days = REVIEW_INTERVAL_DAYS[clamped] ?? 21;
  const due = new Date(from);
  due.setUTCDate(due.getUTCDate() + days);
  return due;
}

/** After a successful review, advance stage (cap at last interval). */
export function advanceReviewStage(stage: number) {
  return Math.min(stage + 1, REVIEW_INTERVAL_DAYS.length - 1);
}

/** After a failed review, drop back toward stage 0. */
export function regressReviewStage(stage: number) {
  return Math.max(stage - 1, 0);
}
