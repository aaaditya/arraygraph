import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "./rate-limit";

describe("rateLimit", () => {
  it("allows bursts within the limit then blocks", () => {
    resetRateLimits();
    const now = 1_000_000;
    expect(rateLimit("t", 2, 60_000, now).ok).toBe(true);
    expect(rateLimit("t", 2, 60_000, now + 1).ok).toBe(true);
    const blocked = rateLimit("t", 2, 60_000, now + 2);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window", () => {
    resetRateLimits();
    const now = 5_000_000;
    expect(rateLimit("w", 1, 1000, now).ok).toBe(true);
    expect(rateLimit("w", 1, 1000, now + 10).ok).toBe(false);
    expect(rateLimit("w", 1, 1000, now + 1001).ok).toBe(true);
  });
});
