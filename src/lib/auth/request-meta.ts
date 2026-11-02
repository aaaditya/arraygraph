import { headers } from "next/headers";

/** Best-effort client key for rate limiting (proxy-aware). */
export async function clientRateKey(prefix: string) {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}
