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
      profileSchema.parse({ name: "Ravi", username: "", bio: "  ", dailyGoalXp: "30" }),
    ).toEqual({ name: "Ravi", username: null, bio: null, dailyGoalXp: 30 });
  });

  it("validates username format", () => {
    expect(
      profileSchema.safeParse({ name: "R", username: "Bad Name!", bio: "", dailyGoalXp: 30 })
        .success,
    ).toBe(false);
    expect(
      profileSchema.parse({ name: "R", username: "Chai_Lover", bio: "", dailyGoalXp: 30 }).username,
    ).toBe("chai_lover");
  });

  it("rejects daily goals outside the options", () => {
    expect(
      profileSchema.safeParse({ name: "R", username: "", bio: "", dailyGoalXp: 33 }).success,
    ).toBe(false);
  });
});

describe("safeCallbackUrl", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeCallbackUrl("/profile")).toBe("/profile");
  });

  it("blocks absolute and protocol-relative urls", () => {
    expect(safeCallbackUrl("https://evil.example")).toBe("/learn");
    expect(safeCallbackUrl("//evil.example")).toBe("/learn");
    expect(safeCallbackUrl("/\\evil.example")).toBe("/learn");
    expect(safeCallbackUrl(undefined, "/")).toBe("/");
  });
});
