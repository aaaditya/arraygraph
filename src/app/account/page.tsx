import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  ChangePasswordForm,
  DeleteAccountForm,
  LogoutEverywhereButton,
} from "@/components/account/security-forms";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login?callbackUrl=/account");

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, password and data. Member since{" "}
          {user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-lg">Profile</span>
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaults={{
              name: user.name ?? "",
              username: user.username ?? "",
              bio: user.bio ?? "",
              dailyGoalXp: user.dailyGoalXp,
              timezone: user.timezone,
            }}
          />
        </CardContent>
      </Card>

      {user.passwordHash ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-lg">Password</span>
            </CardTitle>
            <CardDescription>
              Changing your password signs out other devices on refresh.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ChangePasswordForm />
            <LogoutEverywhereButton />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-lg">Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LogoutEverywhereButton />
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>
            <span className="text-lg">Danger zone</span>
          </CardTitle>
          <CardDescription>
            Permanently deletes your profile, progress, submissions and waitlist data. This cannot
            be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm hasPassword={Boolean(user.passwordHash)} />
        </CardContent>
      </Card>
    </div>
  );
}
