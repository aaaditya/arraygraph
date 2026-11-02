import { describe, expect, it } from "vitest";
import {
  BINARY_SEARCH_PSEUDOCODE,
  buildBinarySearchFrames,
  LINE,
  parseBinarySearchOps,
  type BinarySearchOp,
} from "./engine";

const ops = (...raw: string[]): BinarySearchOp[] => {
  const result = parseBinarySearchOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseBinarySearchOps", () => {
  it("parses search case-insensitively", () => {
    expect(parseBinarySearchOps(["search 7", "FIND 3", ""])).toEqual({
      ok: true,
      value: [
        { kind: "search", target: 7 },
        { kind: "search", target: 3 },
      ],
    });
  });

  it("reports invalid steps", () => {
    const result = parseBinarySearchOps(["search", "push 1", "search abc"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(3);
  });
});

describe("buildBinarySearchFrames", () => {
  it("sorts the initial array and starts idle", () => {
    const [first] = buildBinarySearchFrames([9, 1, 5], []);
    expect(first?.values).toEqual([1, 5, 9]);
    expect(first).toMatchObject({ line: -1, status: "idle" });
  });

  it("finds a target and reports its index", () => {
    const frames = buildBinarySearchFrames([1, 3, 5, 7, 9], ops("search 7"));
    const last = frames.at(-1)!;
    expect(last).toMatchObject({
      output: "3",
      foundIndex: 3,
      line: LINE.equal,
      status: "ok",
    });
  });

  it("reports not found when the target is missing", () => {
    const frames = buildBinarySearchFrames([1, 3, 5], ops("search 4"));
    expect(frames.at(-1)).toMatchObject({
      output: "not found",
      line: LINE.notFound,
      status: "error",
    });
  });

  it("narrows lo/hi across frames", () => {
    const frames = buildBinarySearchFrames([1, 2, 3, 4, 5, 6, 7], ops("search 6"));
    const midFrames = frames.filter((frame) => frame.mid !== undefined);
    expect(midFrames.length).toBeGreaterThan(0);
    expect(frames.some((frame) => frame.line === LINE.goRight || frame.line === LINE.goLeft)).toBe(
      true,
    );
  });

  it("only references real pseudocode lines", () => {
    const frames = buildBinarySearchFrames([2, 4, 6, 8], ops("search 8", "search 1"));
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(BINARY_SEARCH_PSEUDOCODE.length);
    }
  });
});
