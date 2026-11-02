import { createHash, randomBytes } from "node:crypto";
import type { AuthTokenPurpose } from "@prisma/client";
import { db } from "@/lib/db";

const TOKEN_BYTES = 32;

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function createRawToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Creates a one-time AuthToken row and returns the raw token to put in a link. */
export async function issueAuthToken(input: {
  purpose: AuthTokenPurpose;
  identifier: string;
  userId?: string;
  ttlMs: number;
}) {
  const raw = createRawToken();
  const tokenHash = hashToken(raw);
  await db.authToken.create({
    data: {
      purpose: input.purpose,
      identifier: input.identifier.toLowerCase(),
      userId: input.userId,
      tokenHash,
      expiresAt: new Date(Date.now() + input.ttlMs),
    },
  });
  return raw;
}

export async function consumeAuthToken(input: {
  purpose: AuthTokenPurpose;
  rawToken: string;
  identifier?: string;
}) {
  const tokenHash = hashToken(input.rawToken);
  const row = await db.authToken.findUnique({ where: { tokenHash } });
  if (!row || row.purpose !== input.purpose || row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  if (input.identifier && row.identifier !== input.identifier.toLowerCase()) return null;

  await db.authToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return row;
}

export const VERIFY_TTL_MS = 1000 * 60 * 60 * 24;
export const RESET_TTL_MS = 1000 * 60 * 60;
