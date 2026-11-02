import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const db = new PrismaClient();

export const DEMO_USER = {
  email: "demo@visualdsa.dev",
  password: "learn-dsa-123",
  name: "Demo Learner",
  username: "demo",
};

async function main() {
  const passwordHash = await hashPassword(DEMO_USER.password);
  const user = await db.user.upsert({
    where: { email: DEMO_USER.email },
    update: {
      passwordHash,
      name: DEMO_USER.name,
      username: DEMO_USER.username,
      emailVerified: new Date(),
    },
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      username: DEMO_USER.username,
      passwordHash,
      emailVerified: new Date(),
      bio: "Learning DSA one pile of plates at a time.",
      streak: { create: { current: 3, longest: 5, lastActiveDate: new Date() } },
    },
  });

  await db.streak.upsert({
    where: { userId: user.id },
    update: { current: 3, longest: 5, lastActiveDate: new Date() },
    create: { userId: user.id, current: 3, longest: 5, lastActiveDate: new Date() },
  });

  await db.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId: user.id, lessonSlug: "stack-basics" } },
    update: {
      status: "IN_PROGRESS",
      lastSection: "the-moves",
      scrollPosition: 420,
      visualizerState: { index: 2 },
    },
    create: {
      userId: user.id,
      lessonSlug: "stack-basics",
      status: "IN_PROGRESS",
      lastSection: "the-moves",
      scrollPosition: 420,
      visualizerState: { index: 2 },
    },
  });

  await db.xpEvent.createMany({
    data: [{ userId: user.id, amount: 10, reason: "STREAK_BONUS", refId: "seed-streak" }],
    skipDuplicates: true,
  });

  await db.dailyActivity.upsert({
    where: { userId_date: { userId: user.id, date: new Date() } },
    update: { xp: 10 },
    create: { userId: user.id, date: new Date(), xp: 10 },
  });

  const due = new Date();
  due.setDate(due.getDate() - 1);
  await db.reviewItem.upsert({
    where: {
      userId_itemType_itemId: { userId: user.id, itemType: "LESSON", itemId: "stack-basics" },
    },
    update: { dueAt: due, stage: 0 },
    create: {
      userId: user.id,
      itemType: "LESSON",
      itemId: "stack-basics",
      stage: 0,
      dueAt: due,
    },
  });

  console.log(
    `Seeded demo user ${user.email} (password: ${DEMO_USER.password}) with sample progress`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
