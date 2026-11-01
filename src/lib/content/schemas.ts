import { z } from "zod";

export const kebabCase = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be kebab-case (lowercase letters, numbers, dashes)");

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const LESSON_STATUSES = ["draft", "ready"] as const;

export const lessonFrontmatterSchema = z.object({
  slug: kebabCase,
  track: kebabCase,
  module: kebabCase,
  /** Curriculum number such as "5.1" or "S4". Used for ordering and display. */
  chapter: z.string().min(1),
  title: z.string().min(3).max(120),
  summary: z.string().max(200).optional(),
  level: z.enum(LEVELS),
  minutes: z.number().int().positive().max(120),
  status: z.enum(LESSON_STATUSES),
  prerequisites: z.array(kebabCase).default([]),
  patterns: z.array(kebabCase).default([]),
  xp: z.number().int().nonnegative().default(40),
  analogy: z.string().min(2),
  tags: z.array(z.string().min(1)).default([]),
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export const CODE_LANGUAGES = ["python", "javascript", "java", "cpp", "csharp"] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
  csharp: "C#",
};

const codeByLanguage = z.partialRecord(z.enum(CODE_LANGUAGES), z.string().min(1));

export const problemSchema = z.object({
  id: kebabCase,
  title: z.string().min(3),
  difficulty: z.enum(["easy", "medium", "hard"]),
  patterns: z.array(kebabCase).min(1),
  statement: z.string().min(10),
  hints: z.array(z.string().min(3)).min(1).max(5),
  starterCode: codeByLanguage,
  tests: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        hidden: z.boolean().default(false),
      }),
    )
    .min(1),
  solution: z.object({
    approach: z.string().min(10),
    complexity: z.string().min(3),
    code: codeByLanguage,
  }),
  analogy: z.string().optional(),
});

export type Problem = z.infer<typeof problemSchema>;

export const quizQuestionSchema = z
  .object({
    id: kebabCase,
    prompt: z.string().min(5),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.number().int().nonnegative(),
    explain: z.string().min(5),
  })
  .refine((question) => question.answer < question.options.length, {
    message: "answer must be a valid option index",
    path: ["answer"],
  });

export const quizSchema = z.object({
  id: kebabCase,
  title: z.string().min(3),
  lesson: kebabCase.optional(),
  questions: z.array(quizQuestionSchema).min(1),
});

export type Quiz = z.infer<typeof quizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}
