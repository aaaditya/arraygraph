"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField, FormMessage } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { signInAction, signUpAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/auth/schemas";

const initialState: FormState = {};

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />
      <FormMessage message={state.message} ok={state.ok} />
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        New here?{" "}
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormField
        name="name"
        label="Name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        errors={state.fieldErrors?.name}
      />
      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters, with a letter and a number."
        errors={state.fieldErrors?.password}
      />
      <FormMessage message={state.message} ok={state.ok} />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
