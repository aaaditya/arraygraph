import { describe, expect, it } from "vitest";
import { problemSchema, quizSchema } from "./schemas";

describe("quizSchema", () => {
  const base = {
    id: "q",
    title: "Quiz",
    questions: [
      { id: "one", prompt: "Pick one", options: ["a", "b"], answer: 1, explain: "Because" },
    ],
  };

  it("accepts a valid quiz", () => {
    expect(quizSchema.parse(base).questions).toHaveLength(1);
  });

  it("rejects an answer index outside the options", () => {
    const result = quizSchema.safeParse({
      ...base,
      questions: [{ ...base.questions[0], answer: 2 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("problemSchema", () => {
  it("rejects unknown starter code languages", () => {
    const result = problemSchema.safeParse({
      id: "p",
      title: "Problem",
      difficulty: "easy",
      patterns: ["stack"],
      statement: "Do the thing well.",
      hints: ["hint"],
      starterCode: { ruby: "puts 1" },
      tests: [{ input: "1", output: "1" }],
      solution: { approach: "Just do it simply.", complexity: "O(1)", code: {} },
    });
    expect(result.success).toBe(false);
  });
});
