import type { Mailer, MailMessage } from "./types";

/** Development mailer: prints the message (including links) to the server console. */
export class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    console.info(
      [
        "",
        "── VisualDSA mail (ConsoleMailer) ─────────────────────────",
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        message.text,
        "──────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
  }
}
