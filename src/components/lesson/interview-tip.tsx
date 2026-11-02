import { BriefcaseIcon } from "lucide-react";
import type * as React from "react";

export function InterviewTip({
  title = "What the interviewer is really testing",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      aria-label="Interview tip"
      className="border-primary bg-primary/5 my-6 rounded-r-xl border-l-4 p-5"
    >
      <p className="text-primary flex items-center gap-2 font-semibold">
        <BriefcaseIcon className="size-4" aria-hidden="true" />
        {title}
      </p>
      <div className="mt-2 space-y-2 leading-7 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </aside>
  );
}
