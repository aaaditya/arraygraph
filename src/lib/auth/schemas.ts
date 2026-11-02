import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number")
  .refine((value) => !/^\s|\s$/.test(value), "Password cannot start or end with a space");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(72),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(60, "Use at most 60 characters"),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset link is missing or incomplete"),
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(72),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  confirm: z
    .string()
    .trim()
    .refine((value) => value === "DELETE", "Type DELETE to confirm"),
  password: z.string().min(1, "Enter your password").max(72).optional(),
});

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, "3 to 20 characters: lowercase letters, numbers or _");

export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50, 80] as const;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(60, "Use at most 60 characters"),
  username: z
    .union([z.literal(""), usernameSchema])
    .transform((value) => (value === "" ? null : value)),
  bio: z
    .string()
    .trim()
    .max(280, "Use at most 280 characters")
    .transform((value) => (value === "" ? null : value)),
  dailyGoalXp: z.coerce
    .number()
    .int()
    .refine((value) => (DAILY_GOAL_OPTIONS as readonly number[]).includes(value), {
      message: "Pick one of the daily goal options",
    }),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine((value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Pick a valid time zone"),
});

/** Only allow same-origin relative paths so callbackUrl cannot be used as an open redirect. */
export function safeCallbackUrl(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export type FieldErrors = Partial<Record<string, string[]>>;

export type FormState = {
  ok?: boolean;
  /** Echo of submitted values, since React resets uncontrolled fields after a form action. */
  values?: Record<string, string>;
  message?: string;
  fieldErrors?: FieldErrors;
};

export const GENERIC_AUTH_MESSAGE =
  "If that email can be used, we sent the next step. Check your inbox (and the server console in development).";
