import { z } from "zod";

const booleanFlag = z
  .enum(["true", "false", "1", "0"])
  .default("false")
  .transform((value) => value === "true" || value === "1");

const optionalSecret = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine((value) => /^postgres(ql)?:\/\//.test(value), {
        message: "DATABASE_URL must be a postgres:// or postgresql:// connection string",
      }),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    AUTH_URL: z.url().optional(),
    AUTH_TRUST_HOST: booleanFlag,
    AUTH_GITHUB_ID: optionalSecret,
    AUTH_GITHUB_SECRET: optionalSecret,
    AUTH_GOOGLE_ID: optionalSecret,
    AUTH_GOOGLE_SECRET: optionalSecret,
    FEATURE_AI_MOCK: booleanFlag,
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  })
  .superRefine((env, ctx) => {
    const pairs = [
      ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
      ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
    ] as const;
    for (const [id, secret] of pairs) {
      if (Boolean(env[id]) !== Boolean(env[secret])) {
        ctx.addIssue({
          code: "custom",
          path: [env[id] ? secret : id],
          message: `${id} and ${secret} must be set together`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${details}\nSee .env.example.`);
  }
  return result.data;
}

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "true" || process.env.SKIP_ENV_VALIDATION === "1";

export const env: Env = skipValidation
  ? (process.env as unknown as Env)
  : parseEnv(process.env as Record<string, string | undefined>);
