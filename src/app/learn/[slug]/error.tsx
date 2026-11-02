"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function LessonError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback {...props} title="This lesson could not load" />;
}
