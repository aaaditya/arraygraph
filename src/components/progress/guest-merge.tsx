"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { mergeGuestProgressAction } from "@/lib/progress/actions";
import { guestProgressSnapshot, useGuestProgress } from "@/stores/guest-progress";

/** After login/signup, merge localStorage guest progress into the server without clobbering newer data. */
export function GuestProgressMerge() {
  const { status } = useSession();
  const ran = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || ran.current) return;
    ran.current = true;
    void (async () => {
      await useGuestProgress.persist.rehydrate();
      const snapshot = guestProgressSnapshot();
      if (snapshot.lessons.length === 0 && snapshot.drafts.length === 0) return;
      const result = await mergeGuestProgressAction(snapshot);
      if (result.ok) useGuestProgress.getState().clear();
    })();
  }, [status]);

  return null;
}
