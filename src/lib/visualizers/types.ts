/** Shared shape for every visualizer frame. Engines extend it with their own data. */
export type BaseFrame = {
  /** Index into the pseudocode lines, or -1 when no line is active. */
  line: number;
  /** Plain-English narration, read aloud through an aria-live region. */
  caption: string;
  status: "idle" | "ok" | "error";
};

export type PseudocodeLine = { text: string; indent: number };

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };
