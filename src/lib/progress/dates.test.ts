import { describe, expect, it } from "vitest";
import { dateKeyInTimeZone, dateKeyToDbDate } from "./dates";

describe("dateKeyInTimeZone", () => {
  it("uses the learner's local calendar day", () => {
    const lateEveningUtc = new Date("2026-03-10T20:00:00Z");
    expect(dateKeyInTimeZone(lateEveningUtc, "UTC")).toBe("2026-03-10");
    expect(dateKeyInTimeZone(lateEveningUtc, "Asia/Kolkata")).toBe("2026-03-11");
    expect(dateKeyInTimeZone(lateEveningUtc, "America/Los_Angeles")).toBe("2026-03-10");
  });

  it("falls back to UTC for an unknown time zone", () => {
    expect(dateKeyInTimeZone(new Date("2026-01-02T03:04:05Z"), "Not/AZone")).toBe("2026-01-02");
  });
});

describe("dateKeyToDbDate", () => {
  it("produces midnight UTC", () => {
    expect(dateKeyToDbDate("2026-03-11").toISOString()).toBe("2026-03-11T00:00:00.000Z");
  });
});
