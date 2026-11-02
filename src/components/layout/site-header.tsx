import type * as React from "react";
import { mainNav } from "@/lib/site";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({
  userSlot,
  continueSlot,
}: {
  userSlot?: React.ReactNode;
  continueSlot?: React.ReactNode;
}) {
  return (
    <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <MobileNav items={mainNav} />
        <Logo />
        <MainNav items={mainNav} className="ml-6 hidden md:block" />
        <div className="ml-auto flex items-center gap-1">
          {continueSlot}
          <ThemeToggle />
          {userSlot}
        </div>
      </div>
    </header>
  );
}
