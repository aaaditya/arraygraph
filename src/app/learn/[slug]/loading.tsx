import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8" role="status" aria-label="Loading lesson">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-6 h-10 w-3/4" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-10 h-40 w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
