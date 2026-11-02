import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <rect x="8" y="19" width="16" height="5" rx="1.5" className="fill-primary-foreground" />
      <rect
        x="8"
        y="12"
        width="16"
        height="5"
        rx="1.5"
        className="fill-primary-foreground opacity-75"
      />
      <rect
        x="8"
        y="5"
        width="16"
        height="5"
        rx="1.5"
        className="fill-primary-foreground opacity-50"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md font-bold tracking-tight"
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark className="size-8" />
      <span className="text-lg">{siteConfig.name}</span>
    </Link>
  );
}
