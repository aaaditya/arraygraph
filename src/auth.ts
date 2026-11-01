import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { env } from "@/env";
import { verifyPassword } from "@/lib/auth/password";
import { signInSchema } from "@/lib/auth/schemas";
import { db } from "@/lib/db";

const providers: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = signInSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (!user?.passwordHash) return null;
      const valid = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!valid) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        username: user.username,
      };
    },
  }),
];

if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET }));
}
if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET }));
}

export const oauthProviders = providers
  .map((provider) => (typeof provider === "function" ? provider() : provider))
  .filter((provider) => provider.type === "oauth" || provider.type === "oidc")
  .map((provider) => ({ id: provider.id, name: provider.name }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  logger: {
    error(error) {
      if (
        error.name === "CredentialsSignin" ||
        (error as { type?: string }).type === "CredentialsSignin"
      )
        return;
      console.error(error);
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);
      if (params.trigger === "update" && token.id) {
        const fresh = await db.user.findUnique({
          where: { id: token.id },
          select: { name: true, username: true, role: true, image: true },
        });
        if (fresh) {
          token.name = fresh.name;
          token.username = fresh.username;
          token.role = fresh.role;
          token.picture = fresh.image;
        }
      }
      return token;
    },
  },
});
