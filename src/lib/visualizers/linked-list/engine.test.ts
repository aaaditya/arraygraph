import { describe, expect, it } from "vitest";
import {
  buildLinkedListFrames,
  finalLinkedListValues,
  LINE,
  LINKED_LIST_PSEUDOCODE,
  parseLinkedListOps,
  type LinkedListOp,
} from "./engine";

const ops = (...raw: string[]): LinkedListOp[] => {
  const result = parseLinkedListOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseLinkedListOps", () => {
  it("parses append, prepend, delete and reverse", () => {
    expect(parseLinkedListOps(["append 1", "prepend 0", "delete 1", "reverse"])).toEqual({
      ok: true,
      value: [
        { kind: "append", value: "1" },
        { kind: "prepend", value: "0" },
        { kind: "delete", value: "1" },
        { kind: "reverse" },
      ],
    });
  });

  it("reports invalid steps", () => {
    const result = parseLinkedListOps(["append", "reverse 1", "push 2"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(3);
  });
});

describe("buildLinkedListFrames", () => {
  it("appends and prepends in order", () => {
    const frames = buildLinkedListFrames(["b"], ops("append c", "prepend a"));
    expect(finalLinkedListValues(frames)).toEqual(["a", "b", "c"]);
  });

  it("deletes the first matching value", () => {
    const frames = buildLinkedListFrames(["a", "b", "a"], ops("delete a"));
    expect(finalLinkedListValues(frames)).toEqual(["b", "a"]);
    expect(frames.at(-1)).toMatchObject({ output: "a", line: LINE.deleteBody });
  });

  it("errors when deleting a missing value", () => {
    const frames = buildLinkedListFrames(["a"], ops("delete z"));
    expect(frames.at(-1)).toMatchObject({ status: "error" });
  });

  it("reverses the list", () => {
    const frames = buildLinkedListFrames(["1", "2", "3"], ops("reverse"));
    expect(finalLinkedListValues(frames)).toEqual(["3", "2", "1"]);
    expect(frames.at(-1)?.line).toBe(LINE.reverseBody);
  });

  it("only references real pseudocode lines", () => {
    const frames = buildLinkedListFrames(
      ["1"],
      ops("append 2", "prepend 0", "delete 1", "reverse"),
    );
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(LINKED_LIST_PSEUDOCODE.length);
    }
  });
});
