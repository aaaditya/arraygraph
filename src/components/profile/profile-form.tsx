"use client";

import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import { FieldError, FormField, FormMessage } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/auth/actions";
import { DAILY_GOAL_OPTIONS, type FormState } from "@/lib/auth/schemas";

export type ProfileFormValues = {
  name: string;
  username: string;
  bio: string;
  dailyGoalXp: number;
};

export function ProfileForm({ defaults }: { defaults: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const { update } = useSession();

  useEffect(() => {
    if (state.ok) void update();
  }, [state, update]);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <FormField
        name="name"
        label="Name"
        defaultValue={defaults.name}
        autoComplete="name"
        required
        errors={state.fieldErrors?.name}
      />
      <FormField
        name="username"
        label="Username"
        defaultValue={defaults.username}
        autoComplete="username"
        hint="Optional. 3 to 20 lowercase letters, numbers or _."
        errors={state.fieldErrors?.username}
      />
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={defaults.bio}
          maxLength={280}
          aria-invalid={state.fieldErrors?.bio ? true : undefined}
          aria-describedby={state.fieldErrors?.bio ? "bio-error" : undefined}
        />
        <FieldError id="bio-error" errors={state.fieldErrors?.bio} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dailyGoalXp">Daily XP goal</Label>
        <select
          id="dailyGoalXp"
          name="dailyGoalXp"
          defaultValue={defaults.dailyGoalXp}
          className="border-input bg-background focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
          aria-describedby="dailyGoalXp-error"
        >
          {DAILY_GOAL_OPTIONS.map((goal) => (
            <option key={goal} value={goal}>
              {goal} XP a day
            </option>
          ))}
        </select>
        <FieldError id="dailyGoalXp-error" errors={state.fieldErrors?.dailyGoalXp} />
      </div>
      <FormMessage message={state.message} ok={state.ok} />
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
