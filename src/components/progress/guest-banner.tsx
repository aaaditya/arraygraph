"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGuestProgress } from "@/stores/guest-progress";

export function GuestSaveBanner() {
  const { status } = useSession();
  const pathname = usePathname();
  const lessons = useGuestProgress((state) => state.lessons.length);
  const drafts = useGuestProgress((state) => state.drafts.length);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.resolve(useGuestProgress.persist.rehydrate()).finally(() => setReady(true));
  }, []);

  if (!ready || status !== "unauthenticated") return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;
  if (lessons + drafts === 0) return null;

  return (
    <div className="border-highlight/40 bg-highlight/20 border-b px-4 py-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
        <p>
          You have local progress on this device.{" "}
          <span className="font-medium">Sign up to save it across devices.</span>
        </p>
        <Button asChild size="sm">
          <Link href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`}>Sign up to save</Link>
        </Button>
      </div>
    </div>
  );
}
