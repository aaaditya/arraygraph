"use client";

import { LayoutDashboardIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts.at(-1)![0]}` : source.slice(0, 2);
  return letters.toUpperCase();
}

export function UserNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") return <Skeleton className="size-9 rounded-full" />;

  if (!session?.user) {
    const authPaths = ["/login", "/signin", "/signup", "/forgot-password", "/reset-password"];
    const callbackUrl = authPaths.some((path) => pathname.startsWith(path))
      ? "/dashboard"
      : pathname;
    return (
      <Button asChild size="sm">
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign in</Link>
      </Button>
    );
  }

  const { name, email } = session.user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full font-semibold"
          aria-label="Open account menu"
        >
          {initials(name, email)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block truncate">{name ?? "Learner"}</span>
          <span className="text-muted-foreground block truncate text-xs font-normal">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboardIcon aria-hidden="true" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserIcon aria-hidden="true" /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut({ redirectTo: "/" })}>
          <LogOutIcon aria-hidden="true" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
