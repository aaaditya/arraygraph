import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisualDSA",
  description: "Learn DSA, system design and competitive coding visually.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
