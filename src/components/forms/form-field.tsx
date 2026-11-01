import type * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-destructive text-sm">
      {errors[0]}
    </p>
  );
}

export function FormField({
  name,
  label,
  errors,
  hint,
  ...inputProps
}: React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
}) {
  const id = inputProps.id ?? name;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, errors?.length ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

export function FormMessage({ message, ok }: { message?: string; ok?: boolean }) {
  return (
    <div aria-live="polite" className="min-h-5 text-sm">
      {message ? (
        <p className={ok ? "text-success" : "text-destructive"} role={ok ? "status" : "alert"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
