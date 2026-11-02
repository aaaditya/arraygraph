import { describe, expect, it } from "vitest";
import { dateKeyToDbDate } from "./dates";
import { applyActivityToStreak } from "./streaks";

describe("applyActivityToStreak", () => {
  const tz = "Asia/Kolkata";

  it("starts a streak on the first activity day", () => {
    const next = applyActivityToStreak(
      { current: 0, longest: 0, lastActiveDate: null },
      new Date("2026-03-10T10:00:00Z"),
      tz,
    );
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
    expect(next.lastActiveDate?.toISOString()).toBe("2026-03-10T00:00:00.000Z");
  });

  it("is idempotent on the same calendar day", () => {
    const base = {
      current: 4,
      longest: 4,
      lastActiveDate: dateKeyToDbDate("2026-03-10"),
    };
    const next = applyActivityToStreak(base, new Date("2026-03-10T18:00:00Z"), "UTC");
    expect(next).toEqual(base);
  });

  it("extends when the previous active day was yesterday", () => {
    const next = applyActivityToStreak(
      { current: 2, longest: 5, lastActiveDate: dateKeyToDbDate("2026-03-09") },
      new Date("2026-03-10T12:00:00Z"),
      "UTC",
    );
    expect(next.current).toBe(3);
    expect(next.longest).toBe(5);
  });

  it("resets after a gap", () => {
    const next = applyActivityToStreak(
      { current: 9, longest: 9, lastActiveDate: dateKeyToDbDate("2026-03-01") },
      new Date("2026-03-10T12:00:00Z"),
      "UTC",
    );
    expect(next.current).toBe(1);
    expect(next.longest).toBe(9);
  });
});
