import type * as React from "react";

export function Analogy({
  emoji,
  title,
  children,
}: {
  emoji?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      aria-label={`Analogy: ${title}`}
      className="bg-accent text-accent-foreground my-6 rounded-xl border p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        {emoji ? (
          <span className="text-3xl" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase opacity-80">The story</p>
          <p className="text-lg font-bold">{title}</p>
        </div>
      </div>
      <div className="mt-3 space-y-3 leading-7 [&_strong]:font-semibold">{children}</div>
    </aside>
  );
}
