import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/auth/schemas";

/** Legacy path — keep working bookmarks and e2e links. */
export default async function SignInRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
