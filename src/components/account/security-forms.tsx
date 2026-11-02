"use client";

import { useActionState } from "react";
import { FormField, FormMessage } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  changePasswordAction,
  deleteAccountAction,
  logoutEverywhereAction,
} from "@/lib/auth/actions";
import type { FormState } from "@/lib/auth/schemas";

const initial: FormState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormField
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.currentPassword}
      />
      <FormField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />
      <FormField
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <FormMessage message={state.message} ok={state.ok} />
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}

export function LogoutEverywhereButton() {
  return (
    <form action={logoutEverywhereAction}>
      <Button type="submit" variant="outline">
        Sign out everywhere
      </Button>
    </form>
  );
}

export function DeleteAccountForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initial);
  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormField
        name="confirm"
        label="Type DELETE to confirm"
        autoComplete="off"
        required
        errors={state.fieldErrors?.confirm}
      />
      {hasPassword ? (
        <FormField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          errors={state.fieldErrors?.password}
        />
      ) : null}
      <FormMessage message={state.message} ok={state.ok} />
      <Button type="submit" variant="destructive" disabled={pending} className="w-fit">
        {pending ? "Deleting…" : "Delete account and all data"}
      </Button>
    </form>
  );
}
