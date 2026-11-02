import { describe, expect, it } from "vitest";
import { profileSchema, safeCallbackUrl, signUpSchema } from "./schemas";

describe("signUpSchema", () => {
  it("normalises email and accepts a strong enough password", () => {
    const result = signUpSchema.parse({
      name: " Asha ",
      email: " Asha@Example.COM ",
      password: "plates123",
    });
    expect(result).toEqual({ name: "Asha", email: "asha@example.com", password: "plates123" });
  });

  it("rejects weak passwords with a readable message", () => {
    const result = signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/8 characters/);
  });

  it("rejects passwords without numbers", () => {
    const result = signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "onlyletters" });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("turns empty optional fields into null and coerces the goal", () => {
    expect(
      profileSchema.parse({
        name: "Ravi",
        username: "",
        bio: "  ",
        dailyGoalXp: "30",
        timezone: "Asia/Kolkata",
      }),
    ).toEqual({
      name: "Ravi",
      username: null,
      bio: null,
      dailyGoalXp: 30,
      timezone: "Asia/Kolkata",
    });
  });

  it("validates username format", () => {
    expect(
      profileSchema.safeParse({
        name: "R",
        username: "Bad Name!",
        bio: "",
        dailyGoalXp: 30,
        timezone: "UTC",
      }).success,
    ).toBe(false);
    expect(
      profileSchema.parse({
        name: "R",
        username: "Chai_Lover",
        bio: "",
        dailyGoalXp: 30,
        timezone: "UTC",
      }).username,
    ).toBe("chai_lover");
  });

  it("rejects daily goals outside the options", () => {
    expect(
      profileSchema.safeParse({
        name: "R",
        username: "",
        bio: "",
        dailyGoalXp: 33,
        timezone: "UTC",
      }).success,
    ).toBe(false);
  });
});

describe("safeCallbackUrl", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeCallbackUrl("/account")).toBe("/account");
  });

  it("blocks absolute and protocol-relative urls", () => {
    expect(safeCallbackUrl("https://evil.example")).toBe("/dashboard");
    expect(safeCallbackUrl("//evil.example")).toBe("/dashboard");
    expect(safeCallbackUrl("/\\evil.example")).toBe("/dashboard");
    expect(safeCallbackUrl(undefined, "/")).toBe("/");
  });
});
