"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import {
  type FormState,
  profileSchema,
  safeCallbackUrl,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import { db } from "@/lib/db";
import { z } from "zod";

function echo(formData: FormData, fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")]));
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["email"]);
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
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password } = parsed.data;
  try {
    await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password), streak: { create: {} } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { values, fieldErrors: { email: ["An account with this email already exists"] } };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { values, message: "Account created, but we could not sign you in. Please sign in." };
    }
    throw error;
  }
}

export async function oauthSignInAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!/^[a-z0-9-]+$/.test(provider)) return;
  await signIn(provider, { redirectTo: safeCallbackUrl(formData.get("callbackUrl")) });
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "Please sign in again." };

  const values = echo(formData, ["name", "username", "bio", "dailyGoalXp"]);
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username") ?? "",
    bio: formData.get("bio") ?? "",
    dailyGoalXp: formData.get("dailyGoalXp"),
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

  revalidatePath("/profile");
  return { ok: true, values, message: "Profile saved." };
}
