import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type HashMapOp =
  | { kind: "set"; key: string; value: string }
  | { kind: "get"; key: string }
  | { kind: "delete"; key: string };

export type HashEntry = { id: string; key: string; value: string };

export type HashMapFrame = BaseFrame & {
  buckets: HashEntry[][];
  focusBucket?: number;
  focusId?: string;
  focusKind?: "set" | "get" | "delete";
  output?: string;
  opIndex: number;
};

export const BUCKET_COUNT = 7;

export const HASH_MAP_PSEUDOCODE: PseudocodeLine[] = [
  { text: "hash(key) = key.charCodeAt(0) % 7", indent: 0 },
  { text: "set(k, v):", indent: 0 },
  { text: "i = hash(k); update or append in buckets[i]", indent: 1 },
  { text: "get(k):", indent: 0 },
  { text: "i = hash(k); scan chain; return value or miss", indent: 1 },
  { text: "delete(k):", indent: 0 },
  { text: "i = hash(k); remove entry from buckets[i]", indent: 1 },
];

export const LINE = {
  hash: 0,
  set: 1,
  setBody: 2,
  get: 3,
  getBody: 4,
  delete: 5,
  deleteBody: 6,
} as const;

const MAX_KEY_LENGTH = 6;
const MAX_VALUE_LENGTH = 6;

/** Simple demo hash: first character code mod 7 (empty key → 0). */
export function hashKey(key: string): number {
  const code = key.length > 0 ? key.charCodeAt(0) : 0;
  return code % BUCKET_COUNT;
}

function emptyBuckets(): HashEntry[][] {
  return Array.from({ length: BUCKET_COUNT }, () => []);
}

function cloneBuckets(buckets: HashEntry[][]): HashEntry[][] {
  return buckets.map((bucket) => bucket.map((entry) => ({ ...entry })));
}

/** Parses seed pairs like "a:1" into set operations for the initial map. */
export function parseHashSeed(raw: readonly unknown[]): ParseResult<HashMapOp[]> {
  const ops: HashMapOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = String(entry).trim();
    if (!text) return;
    const match = text.match(/^([^:\s]+)\s*:\s*(.+)$/);
    if (!match) {
      errors.push(`Seed ${index + 1}: expected "key:value", got "${text}"`);
      return;
    }
    const key = match[1]!;
    const value = match[2]!.trim();
    if (key.length > MAX_KEY_LENGTH || value.length > MAX_VALUE_LENGTH) {
      errors.push(`Seed ${index + 1}: keep keys and values to ${MAX_KEY_LENGTH} characters`);
      return;
    }
    ops.push({ kind: "set", key, value });
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

/** Parses set / get / delete operations. */
export function parseHashMapOps(raw: string[]): ParseResult<HashMapOp[]> {
  const ops: HashMapOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    switch (command.toLowerCase()) {
      case "set":
      case "put": {
        const key = rest[0];
        const value = rest.slice(1).join(" ");
        if (!key || !value)
          errors.push(`Step ${index + 1}: "set" needs a key and value, like "set a 1"`);
        else if (key.length > MAX_KEY_LENGTH || value.length > MAX_VALUE_LENGTH)
          errors.push(`Step ${index + 1}: keep keys and values to ${MAX_KEY_LENGTH} characters`);
        else ops.push({ kind: "set", key, value });
        break;
      }
      case "get": {
        const key = rest[0];
        if (!key || rest.length > 1)
          errors.push(`Step ${index + 1}: "get" needs exactly one key, like "get a"`);
        else ops.push({ kind: "get", key });
        break;
      }
      case "delete":
      case "remove": {
        const key = rest[0];
        if (!key || rest.length > 1)
          errors.push(`Step ${index + 1}: "delete" needs exactly one key, like "delete a"`);
        else ops.push({ kind: "delete", key });
        break;
      }
      default:
        errors.push(`Step ${index + 1}: unknown operation "${command}". Use set, get or delete`);
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function applySet(
  buckets: HashEntry[][],
  key: string,
  value: string,
  makeId: () => string,
): { buckets: HashEntry[][]; entry: HashEntry; bucketIndex: number; updated: boolean } {
  const bucketIndex = hashKey(key);
  const next = cloneBuckets(buckets);
  const bucket = next[bucketIndex]!;
  const existing = bucket.findIndex((entry) => entry.key === key);
  if (existing >= 0) {
    const entry = { ...bucket[existing]!, value };
    bucket[existing] = entry;
    return { buckets: next, entry, bucketIndex, updated: true };
  }
  const entry: HashEntry = { id: makeId(), key, value };
  bucket.push(entry);
  return { buckets: next, entry, bucketIndex, updated: false };
}

function describe(buckets: HashEntry[][]) {
  const pairs = buckets.flatMap((bucket) => bucket.map((e) => `${e.key}:${e.value}`));
  return pairs.length === 0 ? "Map is empty." : `Entries: ${pairs.join(", ")}.`;
}

/**
 * Builds frames for a chaining hash map with 7 buckets.
 * `initial` may be unused or seed pairs like "a:1".
 */
export function buildHashMapFrames(
  initial: readonly unknown[],
  ops: readonly HashMapOp[],
): HashMapFrame[] {
  let nextId = 0;
  const makeId = () => `entry-${nextId++}`;

  let buckets = emptyBuckets();
  const seed = parseHashSeed(initial);
  if (seed.ok) {
    for (const op of seed.value) {
      if (op.kind !== "set") continue;
      buckets = applySet(buckets, op.key, op.value, makeId).buckets;
    }
  }

  const frames: HashMapFrame[] = [
    {
      buckets: cloneBuckets(buckets),
      line: -1,
      caption: seed.ok
        ? `Start. ${describe(buckets)} Hash = charCode % ${BUCKET_COUNT}.`
        : `Could not parse seed: ${seed.errors.join("; ")}`,
      status: seed.ok ? "idle" : "error",
      opIndex: -1,
    },
  ];

  if (!seed.ok) return frames;

  ops.forEach((op, opIndex) => {
    const bucketIndex = hashKey(op.key);
    switch (op.kind) {
      case "set": {
        frames.push({
          buckets: cloneBuckets(buckets),
          focusBucket: bucketIndex,
          line: LINE.hash,
          caption: `set(${op.key}, ${op.value}): hash("${op.key}") = ${bucketIndex}.`,
          status: "ok",
          opIndex,
        });
        const result = applySet(buckets, op.key, op.value, makeId);
        buckets = result.buckets;
        frames.push({
          buckets: cloneBuckets(buckets),
          focusBucket: bucketIndex,
          focusId: result.entry.id,
          focusKind: "set",
          line: LINE.setBody,
          caption: result.updated
            ? `Updated ${op.key} in bucket ${bucketIndex}.`
            : `Inserted ${op.key}:${op.value} into bucket ${bucketIndex}.`,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "get": {
        frames.push({
          buckets: cloneBuckets(buckets),
          focusBucket: bucketIndex,
          line: LINE.hash,
          caption: `get(${op.key}): hash("${op.key}") = ${bucketIndex}. Scan the chain.`,
          status: "ok",
          opIndex,
        });
        const entry = buckets[bucketIndex]?.find((item) => item.key === op.key);
        if (!entry) {
          frames.push({
            buckets: cloneBuckets(buckets),
            focusBucket: bucketIndex,
            focusKind: "get",
            line: LINE.getBody,
            caption: `${op.key} is not in bucket ${bucketIndex}.`,
            output: "miss",
            status: "error",
            opIndex,
          });
        } else {
          frames.push({
            buckets: cloneBuckets(buckets),
            focusBucket: bucketIndex,
            focusId: entry.id,
            focusKind: "get",
            line: LINE.getBody,
            caption: `Found ${op.key} → ${entry.value}.`,
            output: entry.value,
            status: "ok",
            opIndex,
          });
        }
        break;
      }
      case "delete": {
        frames.push({
          buckets: cloneBuckets(buckets),
          focusBucket: bucketIndex,
          line: LINE.hash,
          caption: `delete(${op.key}): hash("${op.key}") = ${bucketIndex}.`,
          status: "ok",
          opIndex,
        });
        const bucket = buckets[bucketIndex] ?? [];
        const index = bucket.findIndex((item) => item.key === op.key);
        if (index < 0) {
          frames.push({
            buckets: cloneBuckets(buckets),
            focusBucket: bucketIndex,
            focusKind: "delete",
            line: LINE.deleteBody,
            caption: `${op.key} was not found.`,
            status: "error",
            opIndex,
          });
        } else {
          const removed = bucket[index]!;
          const next = cloneBuckets(buckets);
          next[bucketIndex] = [...bucket.slice(0, index), ...bucket.slice(index + 1)];
          buckets = next;
          frames.push({
            buckets: cloneBuckets(buckets),
            focusBucket: bucketIndex,
            focusKind: "delete",
            line: LINE.deleteBody,
            caption: `Removed ${op.key} from bucket ${bucketIndex}.`,
            output: removed.value,
            status: "ok",
            opIndex,
          });
        }
        break;
      }
    }
  });

  return frames;
}
