import "server-only";
import type { RegistrationNoticeDoc } from "./model";

type Notice = Pick<RegistrationNoticeDoc, "emailTo" | "message" | "kind"> & {
  subject: string;
  note?: string;
  participantName?: string;
  countryCode?: string;
};

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "https://jogoscpl2027.vercel.app";

/** Committee inbox copied on every submission, so reviewers hear about new work without opening the Control Room. */
function committeeCopy(kind: Notice["kind"]): string[] {
  const address = process.env.REGISTRATION_COMMITTEE_EMAIL?.trim();
  return kind === "submitted" && address ? address.split(/[,;\s]+/).filter(Boolean) : [];
}

function body(notice: Notice): string {
  const lines = [
    notice.message,
    notice.note ? `\nNota da Comissão Organizadora / Organising Committee note:\n${notice.note}` : "",
    `\nInscrição de delegações / Delegation registration: ${siteUrl()}/pt/delegation`,
    "\nXIII Jogos Desportivos da CPLP · Angola 2027",
    "Esta mensagem foi enviada automaticamente. / This message was sent automatically.",
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Emails a registration notice. Uses Resend when RESEND_API_KEY and REGISTRATION_MAIL_FROM
 * are set, otherwise posts the notice to REGISTRATION_MAIL_WEBHOOK (Power Automate, Zapier, Make).
 * Returns false when neither is configured; the delegation dashboard still shows the notice.
 */
export async function deliverNotice(notice: Notice): Promise<boolean> {
  const to = [notice.emailTo, ...committeeCopy(notice.kind)].filter(Boolean);
  if (to.length === 0) return false;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_MAIL_FROM;
  try {
    if (resendKey && from) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({ from, to, subject: notice.subject, text: body(notice) }),
      });
      return response.ok;
    }
    const url = process.env.REGISTRATION_MAIL_WEBHOOK;
    if (!url) return false;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...notice, to, text: body(notice) }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
