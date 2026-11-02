import type { DefaultSession } from "next-auth";

type AppRole = "LEARNER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role?: AppRole;
    username?: string | null;
    sessionVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      username: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    username: string | null;
    sessionVersion?: number;
  }
}
