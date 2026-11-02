import { describe, expect, it } from "vitest";
import {
  buildSortingFrames,
  finalSortingValues,
  LINE,
  parseSortingOps,
  SORTING_PSEUDOCODE,
  type SortingOp,
} from "./engine";

const ops = (...raw: string[]): SortingOp[] => {
  const result = parseSortingOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseSortingOps", () => {
  it("parses algorithm names", () => {
    expect(parseSortingOps(["bubble"])).toEqual({ ok: true, value: [{ kind: "bubble" }] });
    expect(parseSortingOps(["selection"])).toEqual({
      ok: true,
      value: [{ kind: "selection" }],
    });
    expect(parseSortingOps(["insertion"])).toEqual({
      ok: true,
      value: [{ kind: "insertion" }],
    });
  });

  it("rejects multiple algorithms in one run", () => {
    const result = parseSortingOps(["bubble", "selection"]);
    expect(result.ok).toBe(false);
  });
});

describe("buildSortingFrames", () => {
  it("bubble-sorts the array", () => {
    const frames = buildSortingFrames([3, 1, 2], ops("bubble"));
    expect(finalSortingValues(frames)).toEqual([1, 2, 3]);
    expect(frames.some((frame) => frame.comparing)).toBe(true);
    expect(frames.some((frame) => frame.swapping)).toBe(true);
    expect(frames.at(-1)?.line).toBe(LINE.done);
  });

  it("selection-sorts the array", () => {
    const frames = buildSortingFrames([4, 2, 5, 1], ops("selection"));
    expect(finalSortingValues(frames)).toEqual([1, 2, 4, 5]);
  });

  it("insertion-sorts the array", () => {
    const frames = buildSortingFrames([3, 2, 1], ops("insertion"));
    expect(finalSortingValues(frames)).toEqual([1, 2, 3]);
  });

  it("handles already-sorted and empty inputs", () => {
    expect(finalSortingValues(buildSortingFrames([1, 2, 3], ops("bubble")))).toEqual([1, 2, 3]);
    expect(finalSortingValues(buildSortingFrames([], ops("selection")))).toEqual([]);
  });

  it("only references real pseudocode lines", () => {
    const frames = buildSortingFrames([5, 1, 4, 2], ops("insertion"));
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(SORTING_PSEUDOCODE.length);
    }
  });
});
