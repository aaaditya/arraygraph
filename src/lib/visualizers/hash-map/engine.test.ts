import { describe, expect, it } from "vitest";
import {
  BUCKET_COUNT,
  buildHashMapFrames,
  HASH_MAP_PSEUDOCODE,
  hashKey,
  parseHashMapOps,
  parseHashSeed,
  type HashMapOp,
} from "./engine";

const ops = (...raw: string[]): HashMapOp[] => {
  const result = parseHashMapOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("hashKey", () => {
  it("uses charCode % 7", () => {
    expect(hashKey("a")).toBe("a".charCodeAt(0) % BUCKET_COUNT);
    expect(hashKey("")).toBe(0);
  });
});

describe("parseHashSeed / parseHashMapOps", () => {
  it("parses seed pairs and set/get/delete", () => {
    expect(parseHashSeed(["a:1", "b:2"])).toEqual({
      ok: true,
      value: [
        { kind: "set", key: "a", value: "1" },
        { kind: "set", key: "b", value: "2" },
      ],
    });
    expect(parseHashMapOps(["set c 3", "get a", "delete b"])).toEqual({
      ok: true,
      value: [
        { kind: "set", key: "c", value: "3" },
        { kind: "get", key: "a" },
        { kind: "delete", key: "b" },
      ],
    });
  });
});

describe("buildHashMapFrames", () => {
  it("seeds from initial pairs and retrieves values", () => {
    const frames = buildHashMapFrames(["a:1"], ops("get a"));
    expect(frames.at(-1)).toMatchObject({ output: "1", status: "ok" });
  });

  it("updates an existing key on set", () => {
    const frames = buildHashMapFrames(["a:1"], ops("set a 9", "get a"));
    expect(frames.at(-1)?.output).toBe("9");
  });

  it("reports a miss and delete errors", () => {
    const miss = buildHashMapFrames([], ops("get z"));
    expect(miss.at(-1)).toMatchObject({ output: "miss", status: "error" });
    const del = buildHashMapFrames([], ops("delete z"));
    expect(del.at(-1)?.status).toBe("error");
  });

  it("places entries into the hashed bucket", () => {
    const frames = buildHashMapFrames([], ops("set a 1"));
    const last = frames.at(-1)!;
    const bucket = hashKey("a");
    expect(last.focusBucket).toBe(bucket);
    expect(last.buckets[bucket]?.some((entry) => entry.key === "a")).toBe(true);
  });

  it("only references real pseudocode lines", () => {
    const frames = buildHashMapFrames(["a:1"], ops("set b 2", "get a", "delete a", "get a"));
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(HASH_MAP_PSEUDOCODE.length);
    }
  });
});
