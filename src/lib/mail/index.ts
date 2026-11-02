import "server-only";

import { env } from "@/env";
import { ConsoleMailer } from "./console-mailer";
import { ResendMailer } from "./resend-mailer";
import type { Mailer } from "./types";

let cached: Mailer | undefined;

/** Swappable mailer: Resend when configured, otherwise console logging. */
export function getMailer(): Mailer {
  if (cached) return cached;
  if (env.RESEND_API_KEY) {
    cached = new ResendMailer(env.RESEND_API_KEY, env.MAIL_FROM);
  } else {
    cached = new ConsoleMailer();
  }
  return cached;
}

export type { Mailer, MailMessage } from "./types";
