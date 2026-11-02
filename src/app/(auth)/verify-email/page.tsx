import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token?.trim() ?? "";
  const result = token
    ? await verifyEmailAction(token)
    : { ok: false as const, message: "Verification link is missing." };

  return (
    <AuthCard
      title={result.ok ? "Email verified" : "Could not verify"}
      description={result.message ?? "Something went wrong."}
    >
      <Button asChild>
        <Link href={result.ok ? "/dashboard" : "/login"}>Continue</Link>
      </Button>
    </AuthCard>
  );
}
