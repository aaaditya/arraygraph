"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { clientRateKey } from "@/lib/auth/request-meta";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  type FormState,
  GENERIC_AUTH_MESSAGE,
  profileSchema,
  resetPasswordSchema,
  safeCallbackUrl,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import { consumeAuthToken, issueAuthToken, RESET_TTL_MS, VERIFY_TTL_MS } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { getMailer } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

function echo(formData: FormData, fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")]));
}

const AUTH_WINDOW_MS = 15 * 60 * 1000;
// Parallel Playwright workers share one IP in CI; keep production-tight limits locally.
const AUTH_LIMITS = {
  signin: process.env.CI ? 200 : 20,
  signup: process.env.CI ? 100 : 10,
  forgot: process.env.CI ? 50 : 8,
  reset: process.env.CI ? 50 : 8,
  verify: process.env.CI ? 100 : 20,
} as const;

async function sendVerifyEmail(email: string, name: string | null, rawToken: string) {
  const link = absoluteUrl(`/verify-email?token=${encodeURIComponent(rawToken)}`);
  await getMailer().send({
    to: email,
    subject: "Verify your VisualDSA email",
    text: `Hi ${name ?? "there"},\n\nConfirm your email:\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${name ?? "there"},</p><p><a href="${link}">Confirm your email</a></p><p>This link expires in 24 hours.</p>`,
  });
}

async function sendResetEmail(email: string, rawToken: string) {
  const link = absoluteUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
  await getMailer().send({
    to: email,
    subject: "Reset your VisualDSA password",
    text: `Reset your password:\n${link}\n\nThis link expires in 1 hour. If you did not ask for this, ignore the email.`,
    html: `<p><a href="${link}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
  });
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["email"]);
  const limited = rateLimit(await clientRateKey("signin"), AUTH_LIMITS.signin, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { values, message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { values, message: "That email and password do not match. Try again." };
    }
    throw error;
  }
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["name", "email"]);
  const limited = rateLimit(await clientRateKey("signup"), AUTH_LIMITS.signup, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { values, message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    // Do not reveal that the email is taken.
    return { values, message: GENERIC_AUTH_MESSAGE };
  }

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        streak: { create: {} },
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { values, message: GENERIC_AUTH_MESSAGE };
    }
    throw error;
  }

  const raw = await issueAuthToken({
    purpose: "EMAIL_VERIFY",
    identifier: email,
    userId,
    ttlMs: VERIFY_TTL_MS,
  });
  await sendVerifyEmail(email, name, raw);

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        values,
        message: "Account created. Please sign in, then check your email to verify.",
      };
    }
    throw error;
  }
}

export async function oauthSignInAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!/^[a-z0-9-]+$/.test(provider)) return;
  await signIn(provider, { redirectTo: safeCallbackUrl(formData.get("callbackUrl")) });
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = echo(formData, ["email"]);
  const limited = rateLimit(await clientRateKey("forgot"), AUTH_LIMITS.forgot, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { values, message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, passwordHash: true },
  });
  if (user?.passwordHash) {
    const raw = await issueAuthToken({
      purpose: "PASSWORD_RESET",
      identifier: user.email,
      userId: user.id,
      ttlMs: RESET_TTL_MS,
    });
    await sendResetEmail(user.email, raw);
  }

  return { ok: true, values, message: GENERIC_AUTH_MESSAGE };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const limited = rateLimit(await clientRateKey("reset"), AUTH_LIMITS.reset, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const row = await consumeAuthToken({
    purpose: "PASSWORD_RESET",
    rawToken: parsed.data.token,
  });
  if (!row?.userId) {
    return { message: "This reset link is invalid or has expired. Request a new one." };
  }

  await db.user.update({
    where: { id: row.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      sessionVersion: { increment: 1 },
      emailVerified: new Date(),
    },
  });

  return { ok: true, message: "Password updated. You can sign in with your new password." };
}

export async function verifyEmailAction(token: string): Promise<FormState> {
  const limited = rateLimit(await clientRateKey("verify"), AUTH_LIMITS.verify, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }
  const row = await consumeAuthToken({ purpose: "EMAIL_VERIFY", rawToken: token });
  if (!row?.userId) {
    return { message: "This verification link is invalid or has expired." };
  }
  await db.user.update({
    where: { id: row.userId },
    data: { emailVerified: new Date() },
  });
  return { ok: true, message: "Email verified. Welcome aboard." };
}

export async function resendVerificationAction(): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { message: "Please sign in again." };
  const limited = rateLimit(await clientRateKey(`reverify:${session.user.id}`), 5, AUTH_WINDOW_MS);
  if (!limited.ok) {
    return { message: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true, name: true },
  });
  if (!user) return { message: "Please sign in again." };
  if (user.emailVerified) return { ok: true, message: "Your email is already verified." };

  const raw = await issueAuthToken({
    purpose: "EMAIL_VERIFY",
    identifier: user.email,
    userId: session.user.id,
    ttlMs: VERIFY_TTL_MS,
  });
  await sendVerifyEmail(user.email, user.name, raw);
  return { ok: true, message: GENERIC_AUTH_MESSAGE };
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "Please sign in again." };

  const values = echo(formData, ["name", "username", "bio", "dailyGoalXp", "timezone"]);
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username") ?? "",
    bio: formData.get("bio") ?? "",
    dailyGoalXp: formData.get("dailyGoalXp"),
    timezone: formData.get("timezone") ?? "Asia/Kolkata",
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await db.user.update({ where: { id: session.user.id }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { values, fieldErrors: { username: ["That username is taken"] } };
    }
    throw error;
  }

  revalidatePath("/account");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true, values, message: "Profile saved." };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "Please sign in again." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { message: "This account uses social login. Set a password by using reset mail later." };
  }
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { fieldErrors: { currentPassword: ["Current password is incorrect"] } };

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  return {
    ok: true,
    message: "Password changed. Use “Sign out everywhere” if you need other devices signed out.",
  };
}

export async function logoutEverywhereAction() {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { sessionVersion: { increment: 1 } },
  });
  await signOut({ redirectTo: "/login" });
}

export async function deleteAccountAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "Please sign in again." };

  const parsed = deleteAccountSchema.safeParse({
    confirm: formData.get("confirm"),
    password: formData.get("password") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { message: "Please sign in again." };
  if (user.passwordHash) {
    if (!parsed.data.password) {
      return { fieldErrors: { password: ["Enter your password to delete this account"] } };
    }
    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) return { fieldErrors: { password: ["Password is incorrect"] } };
  }

  await db.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
  return { ok: true };
}
