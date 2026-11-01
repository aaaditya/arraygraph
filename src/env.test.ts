import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  AUTH_SECRET: "x".repeat(32),
};

describe("parseEnv", () => {
  it("accepts a minimal valid environment and applies defaults", () => {
    const env = parseEnv(valid);
    expect(env.FEATURE_AI_MOCK).toBe(false);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.AUTH_GITHUB_ID).toBeUndefined();
  });

  it("parses boolean feature flags", () => {
    expect(parseEnv({ ...valid, FEATURE_AI_MOCK: "true" }).FEATURE_AI_MOCK).toBe(true);
    expect(parseEnv({ ...valid, FEATURE_AI_MOCK: "0" }).FEATURE_AI_MOCK).toBe(false);
  });

  it("rejects a short AUTH_SECRET", () => {
    expect(() => parseEnv({ ...valid, AUTH_SECRET: "short" })).toThrow(/AUTH_SECRET/);
  });

  it("rejects a non-postgres DATABASE_URL", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://x" })).toThrow(/DATABASE_URL/);
  });

  it("requires OAuth id and secret together", () => {
    expect(() => parseEnv({ ...valid, AUTH_GITHUB_ID: "abc" })).toThrow(/AUTH_GITHUB_SECRET/);
    expect(parseEnv({ ...valid, AUTH_GITHUB_ID: "", AUTH_GITHUB_SECRET: "" }).AUTH_GITHUB_ID).toBe(
      undefined,
    );
  });
});
