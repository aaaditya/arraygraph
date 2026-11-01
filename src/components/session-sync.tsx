"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const AUTH_PAGES = /^\/(signin|signup)(\/|$)/;

/**
 * Sign-in and sign-up run as server actions that redirect on the server, so the client session
 * cache does not know the user changed. Refresh it once when leaving an auth page.
 */
export function SessionSync() {
  const pathname = usePathname();
  const { update } = useSession();
  const previous = useRef(pathname);

  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;
    if (from !== pathname && AUTH_PAGES.test(from)) void update();
  }, [pathname, update]);

  return null;
}
