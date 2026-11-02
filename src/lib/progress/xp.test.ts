import { describe, expect, it } from "vitest";
import { lessonAward, problemXp, quizAward, XP } from "./xp";

describe("XP rules", () => {
  it("maps problem difficulty", () => {
    expect(problemXp("easy")).toBe(XP.PROBLEM_EASY);
    expect(problemXp("medium")).toBe(XP.PROBLEM_MEDIUM);
    expect(problemXp("hard")).toBe(XP.PROBLEM_HARD);
  });

  it("builds idempotent award refs", () => {
    expect(lessonAward("stack-basics", 40)).toEqual({
      reason: "LESSON",
      refId: "stack-basics",
      amount: 40,
    });
    expect(quizAward("stack-basics-quiz").amount).toBe(XP.QUIZ);
  });
});
