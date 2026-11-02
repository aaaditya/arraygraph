import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, oauthProviders } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { safeCallbackUrl } from "@/lib/auth/schemas";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <AuthCard title="Welcome back" description="Sign in to keep your streak and progress.">
      <OAuthButtons providers={oauthProviders} callbackUrl={callbackUrl} />
      <SignInForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
