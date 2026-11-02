import type { Mailer, MailMessage } from "./types";

/**
 * Thin Resend HTTP client. Only constructed when RESEND_API_KEY is present.
 * No SDK dependency — keeps the foundation free of paid-key requirements.
 */
export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: MailMessage): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend mail failed (${response.status}): ${body}`);
    }
  }
}
