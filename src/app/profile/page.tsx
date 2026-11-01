import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/profile");

  const [user, xp, completed] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { streak: true } }),
    db.xpEvent.aggregate({ where: { userId: session.user.id }, _sum: { amount: true } }),
    db.lessonProgress.count({ where: { userId: session.user.id, status: "COMPLETED" } }),
  ]);
  if (!user) redirect("/signin?callbackUrl=/profile");

  const stats = [
    { label: "Total XP", value: xp._sum.amount ?? 0 },
    { label: "Lessons completed", value: completed },
    { label: "Current streak", value: `${user.streak?.current ?? 0} days` },
  ];

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground mt-1">
          Member since{" "}
          {user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-1 p-4">
            <dt className="text-muted-foreground text-sm">{stat.label}</dt>
            <dd className="text-2xl font-bold">{stat.value}</dd>
          </Card>
        ))}
      </dl>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-lg">Edit details</span>
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
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
