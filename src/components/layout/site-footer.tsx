import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          {siteConfig.name}. {siteConfig.tagline}
        </p>
        <nav aria-label="Footer">
          <ul className="flex gap-4">
            <li>
              <Link
                href="/learn"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Lessons
              </Link>
            </li>
            <li>
              <Link
                href="/visualizers/stack"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Visualizers
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
