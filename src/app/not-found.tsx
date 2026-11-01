import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <p className="text-primary font-mono text-sm font-semibold">404</p>
      <h1 className="mt-2 text-3xl font-bold">This page fell off the stack</h1>
      <p className="text-muted-foreground mt-2">
        We looked everywhere, even with binary search. It is not here.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/learn">Browse lessons</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
