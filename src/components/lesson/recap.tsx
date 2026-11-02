import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

export function Recap({
  children,
  next,
  nextTitle,
}: {
  children: React.ReactNode;
  next?: string;
  nextTitle?: string;
}) {
  return (
    <section
      aria-label="Recap"
      className="bg-success/10 border-success/40 my-6 rounded-xl border p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 font-semibold">
        <SparklesIcon className="text-success size-4" aria-hidden="true" /> Say it like a
        10-year-old
      </p>
      <div className="mt-2 space-y-2 leading-7 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      {next ? (
        <Link
          href={`/learn/${next}`}
          className="text-primary mt-4 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
        >
          Next: {nextTitle ?? next} <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
