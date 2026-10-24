import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, type Tone } from "@/components/admin/status-badge";
import { initials, shortName, stampFormatFor } from "@/components/admin/time";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { intlLocale, translator, type Translate } from "@/lib/admin/i18n/translate";
import { getStore } from "@/lib/store";

const toneFor = (action: string): Tone => (/delete|reject|deactiv/.test(action) ? "error" : /approv|publish/.test(action) ? "success" : "neutral");

/** Stored activity actions are English; bulk deletes carry a count. */
function actionText(action: string, t: Translate) {
  const bulk = /^deleted (\d+) items$/.exec(action);
  return bulk ? t("deleted {n} items", { n: bulk[1] }) : t(action);
}

export default async function ActivityPage() {
  await requireUser("activity");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const zone = "Africa/Luanda";
  const dayFormat = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", day: "numeric", month: "long", timeZone: zone });
  const timeFormat = new Intl.DateTimeFormat(intlLocale(locale), { hour: "2-digit", minute: "2-digit", timeZone: zone });
  const stampFormat = stampFormatFor(locale);
  const entries = await getStore().listAudit(300);

  const days: Array<{ day: string; items: typeof entries }> = [];
  for (const e of entries) {
    const day = dayFormat.format(new Date(e.at));
    const last = days.at(-1);
    if (last?.day === day) last.items.push(e);
    else days.push({ day, items: [e] });
  }

  return (
    <>
      <PageHeader
        title={t("Activity log")}
        description={t("Every change made in the Control Room: who, what and when (Luanda time). Kept for accountability on results.")}
        icon="clock"
      />
      {entries.length === 0 ? (
        <EmptyState icon="clock" title={t("No activity yet")}>
          {t("Changes appear here as the team works.")}
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-col gap-6 md:hidden">
            {days.map((d) => (
              <section key={d.day} className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{d.day}</h2>
                <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
                  {d.items.map((e, i) => (
                    <li key={`${e.at}-${i}`} className="flex gap-3 px-4 py-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-[10px] font-bold text-secondary-foreground">{initials(shortName(e.actor, t))}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-sm leading-snug">
                          <strong className="font-semibold">{shortName(e.actor, t)}</strong> <StatusBadge tone={toneFor(e.action)} className="h-5 px-2 align-middle">{actionText(e.action, t)}</StatusBadge>{" "}
                          {e.summary ?? e.itemId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeFormat.format(new Date(e.at))}
                          {e.collection && ` · ${e.collection}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="h-11 w-[11rem] pl-5">{t("When")}</TableHead>
                  <TableHead className="h-11 w-[14rem]">{t("Who")}</TableHead>
                  <TableHead className="h-11 w-[11rem]">{t("Action")}</TableHead>
                  <TableHead className="h-11 pr-5">{t("Item")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e, i) => (
                  <TableRow key={`${e.at}-${i}`}>
                    <TableCell className="pl-5 text-xs text-muted-foreground tabular-nums">{stampFormat.format(new Date(e.at))}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-secondary text-[10px] font-bold text-secondary-foreground">{initials(shortName(e.actor, t))}</AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">{shortName(e.actor, t)}</span>
                          <span className="text-xs text-muted-foreground">{e.role}</span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col items-start gap-1">
                        <StatusBadge tone={toneFor(e.action)}>{actionText(e.action, t)}</StatusBadge>
                        {e.collection && <span className="text-xs text-muted-foreground">{e.collection}</span>}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 whitespace-normal">{e.summary ?? e.itemId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
