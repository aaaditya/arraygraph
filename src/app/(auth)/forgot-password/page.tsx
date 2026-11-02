import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="We will email a one-time link. In development it is also printed in the server console."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
