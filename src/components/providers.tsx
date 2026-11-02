"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type * as React from "react";
import { useEffect } from "react";
import { SessionSync } from "@/components/session-sync";
import { usePreferences } from "@/stores/preferences";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void usePreferences.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      <SessionSync />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
