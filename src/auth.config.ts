import type { NextAuthConfig } from "next-auth";

export const PROTECTED_PREFIXES = ["/profile", "/dashboard"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Edge-safe configuration shared by middleware and the full server config in `auth.ts`.
 * It must not import Prisma or any Node-only module.
 */
export const authConfig = {
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      if (isProtectedPath(request.nextUrl.pathname)) return Boolean(auth?.user);
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "LEARNER";
        token.username = user.username ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
