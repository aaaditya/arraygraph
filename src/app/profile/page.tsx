import { redirect } from "next/navigation";

/** Legacy path — account is the canonical settings page. */
export default function ProfileRedirectPage() {
  redirect("/account");
}
