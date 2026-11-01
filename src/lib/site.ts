export const siteConfig = {
  name: "VisualDSA",
  tagline: "Analogy first. Visuals second. Code last.",
  description:
    "Learn data structures, algorithms, system design and competitive coding the way you would teach a child, then ace your tech interviews.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  repo: "https://github.com/",
} as const;

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/learn", label: "Learn" },
  { href: "/visualizers/stack", label: "Visualizers" },
];
