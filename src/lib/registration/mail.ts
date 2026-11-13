import "server-only";
import type { RegistrationNoticeDoc } from "./model";

/** Sends the notice when REGISTRATION_MAIL_WEBHOOK is set. Otherwise the dashboard keeps it. */
export async function deliverNotice(notice: Pick<RegistrationNoticeDoc, "emailTo" | "message" | "kind"> & { subject: string }): Promise<boolean> {
  const url = process.env.REGISTRATION_MAIL_WEBHOOK;
  if (!url || !notice.emailTo) return false;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(notice),
    });
    return response.ok;
  } catch {
    return false;
  }
}
