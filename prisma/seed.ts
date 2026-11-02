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
    update: {},
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      username: DEMO_USER.username,
      passwordHash,
      bio: "Learning DSA one pile of plates at a time.",
      streak: { create: {} },
    },
  });
  console.log(`Seeded demo user ${user.email} (password: ${DEMO_USER.password})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
