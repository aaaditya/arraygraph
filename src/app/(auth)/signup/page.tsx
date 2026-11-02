import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, oauthProviders } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { safeCallbackUrl } from "@/lib/auth/schemas";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <AuthCard
      title="Create your account"
      description="Free forever. Track XP, streaks and spaced-repetition reviews."
    >
      <OAuthButtons providers={oauthProviders} callbackUrl={callbackUrl} />
      <SignUpForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
