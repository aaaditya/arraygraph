import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10" role="status" aria-label="Loading">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
