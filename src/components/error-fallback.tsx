"use client";

import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center"
    >
      <AlertTriangleIcon className="text-destructive size-10" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        Even the best algorithms hit an edge case. Try again, or head back home.
      </p>
      {error.digest ? (
        <p className="text-muted-foreground mt-2 font-mono text-xs">Error id: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
