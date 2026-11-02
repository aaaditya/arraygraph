import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token?.trim() ?? "";
  if (!token) {
    return (
      <AuthCard title="Link missing" description="Request a fresh reset link to continue.">
        <Button asChild>
          <Link href="/forgot-password">Forgot password</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" description="This also signs out other devices.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
