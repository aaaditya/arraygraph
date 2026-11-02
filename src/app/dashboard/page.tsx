import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContinueLearningCard } from "@/components/progress/continue-learning";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/progress/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/login?callbackUrl=/dashboard");

  const goalProgress = Math.min(
    100,
    Math.round((data.todayXp / Math.max(data.dailyGoalXp, 1)) * 100),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{data.user.name ? `, ${data.user.name}` : ""}. Keep the streak alive.
        </p>
      </div>

      {data.resume ? (
        <ContinueLearningCard
          lessonSlug={data.resume.lessonSlug}
          lastSection={data.resume.lastSection}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-lg">Start learning</span>
            </CardTitle>
            <CardDescription>
              No in-progress lesson yet. Jump into the stack chapter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className="text-primary font-medium underline-offset-4 hover:underline"
              href="/learn/stack-basics"
            >
              Open Stack basics
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-2 p-4">
          <p className="text-muted-foreground text-sm">Total XP</p>
          <p className="text-3xl font-bold">{data.totalXp}</p>
        </Card>
        <Card className="gap-2 p-4">
          <p className="text-muted-foreground text-sm">Streak</p>
          <p className="text-3xl font-bold">{data.streak?.current ?? 0} days</p>
          <p className="text-muted-foreground text-xs">Longest {data.streak?.longest ?? 0}</p>
        </Card>
        <Card className="gap-2 p-4">
          <p className="text-muted-foreground text-sm">Lessons</p>
          <p className="text-3xl font-bold">
            {data.completed}
            <span className="text-muted-foreground text-base font-normal">
              {" "}
              done · {data.inProgress} in progress
            </span>
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-lg">Today&apos;s goal</span>
          </CardTitle>
          <CardDescription>
            {data.todayXp} / {data.dailyGoalXp} XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={goalProgress} aria-label="Daily XP progress" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-lg">Streak calendar</span>
          </CardTitle>
          <CardDescription>Last 28 days in your time zone ({data.user.timezone}).</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-7 gap-2">
            {data.calendar.map((day) => (
              <li
                key={day.date}
                title={`${day.date}: ${day.xp} XP`}
                className={
                  day.xp > 0
                    ? "bg-success/70 aspect-square rounded-sm"
                    : "bg-muted aspect-square rounded-sm"
                }
              >
                <span className="sr-only">
                  {day.date}: {day.xp} XP
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-lg">Due reviews</span>
            </CardTitle>
            <CardDescription>Spaced repetition queue (server-scheduled).</CardDescription>
          </CardHeader>
          <CardContent>
            {data.dueReviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing due. Finish a lesson to schedule reviews.
              </p>
            ) : (
              <ul className="grid gap-2">
                {data.dueReviews.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      href={item.itemType === "LESSON" ? `/learn/${item.itemId}` : "/learn"}
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      {item.itemId}
                    </Link>
                    <Badge variant="secondary">stage {item.stage}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-lg">Weakest patterns</span>
            </CardTitle>
            <CardDescription>
              Pattern practice lands in a later phase. For now, re-open chapters with due reviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Complete quizzes and problems to populate weakness signals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
