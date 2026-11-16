import { KeyRound, TriangleAlert, UserCheck, UserX } from "lucide-react";
import { deleteUser, setUserActive } from "@/app/admin/actions/admin";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { EmptyState } from "@/components/admin/empty-state";
import { IconAction } from "@/components/admin/icon-action";
import { Flash } from "@/components/admin/flash";
import { ItemList, type ListRow } from "@/components/admin/item-list";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { initials } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import Link from "next/link";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { assignableRoles, roleDescriptions, roleLabels } from "@/lib/admin/roles";
import type { UserDoc } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const session = await requireUser("users");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const users = await loadItems<UserDoc>("users");
  const activeSupers = users.filter((u) => u.role === "super" && u.active).length;
  const hasSuper = activeSupers > 0;

  const sportName = (id: string) => {
    const sport = sports.find((s) => s.id === id);
    return sport ? pick(sport.name, locale) : id;
  };

  const countryLabel = (code: string) => {
    const country = countries.find((c) => c.code === code);
    return country ? pick(country.name, locale) : code;
  };
  const withoutOfficer = countries.filter((c) => !users.some((u) => u.active && u.role === "delegation" && u.countryCode === c.code));
  const officerCountry = new Set<string>();
  const sharedCountry = users.filter((u) => u.active && u.role === "delegation" && u.countryCode && (officerCountry.has(u.countryCode) || !officerCountry.add(u.countryCode)));

  const rows: ListRow[] = users.map((u) => ({
    id: u.id,
    href: `/admin/users/${u.id}`,
    title: u.name,
    subtitle: u.email,
    leading: (
      <Avatar className={cn("size-10", !u.active && "opacity-50")}>
        <AvatarFallback className={cn("text-xs font-bold", u.role === "super" ? "bg-sidebar text-highlight" : "bg-secondary text-secondary-foreground")}>
          {initials(u.name)}
        </AvatarFallback>
      </Avatar>
    ),
    badges: [
      { label: t(roleLabels[u.role]), tone: u.role === "super" ? "brand" : "info" },
      ...(!u.active ? [{ label: t("Deactivated"), tone: "neutral" as const }] : []),
      ...(u.role === "delegation" && u.countryCode ? [{ label: countryLabel(u.countryCode), tone: "neutral" as const }] : []),
      ...u.sportIds.map((id) => ({ label: sportName(id), tone: "neutral" as const })),
    ],
    actions: (
      <>
        {u.active && (
          <IconAction href={`/admin/users/${u.id}#f-password`} label={t("Set a new password for {name}", { name: u.name })} icon={<KeyRound />} />
        )}
        {u.email !== session.email && (
          <ConfirmAction
            action={setUserActive.bind(null, u.id, !u.active)}
            title={u.active ? t("Deactivate {name}?", { name: u.name }) : t("Reactivate {name}?", { name: u.name })}
            description={
              u.active ? t("They can no longer sign in. Their past changes stay in the activity log.") : t("They can sign in again with their existing password.")
            }
            confirmLabel={u.active ? t("Deactivate") : t("Reactivate")}
            destructive={u.active}
            trigger={
              <IconAction
                label={u.active ? t("Deactivate {name}", { name: u.name }) : t("Reactivate {name}", { name: u.name })}
                icon={u.active ? <UserX /> : <UserCheck />}
                destructive={u.active}
              />
            }
          />
        )}
      </>
    ),
    deleteAction: !u.active && u.email !== session.email ? deleteUser.bind(null, u.id) : undefined,
    deleteDescription: t("The account is removed. Their past changes stay in the activity log."),
  }));

  return (
    <>
      <Flash param="saved" message={query.saved ? t("User saved.") : null} />
      <Flash param="deleted" message={query.deleted ? t("User deleted.") : null} />
      <PageHeader
        title={t("Users")}
        description={t(
          "One officer account per country, plus the people who review registrations. Officers sign in on the public site, not here.",
        )}
        icon="id"
        primary={{ href: "/admin/users/new", label: t("Add user") }}
      />
      <div className="flex flex-col gap-6">
        {!hasSuper && (
          <Alert className="border-highlight bg-warning text-warning-foreground">
            <TriangleAlert />
            <AlertTitle>{t("You are using the setup login")}</AlertTitle>
            <AlertDescription className="text-warning-foreground">
              {t("Create your own Super admin account first: the setup login stops working as soon as one exists.")}
            </AlertDescription>
          </Alert>
        )}
        {activeSupers === 1 && (
          <Alert className="border-highlight bg-warning text-warning-foreground">
            <TriangleAlert />
            <AlertTitle>{t("Add a second Super admin")}</AlertTitle>
            <AlertDescription className="text-warning-foreground">
              {t(
                "Only a Super admin can set passwords for other people. With just one, nobody can help if that person is locked out and the reset email does not reach them.",
              )}
            </AlertDescription>
          </Alert>
        )}

        {hasSuper && withoutOfficer.length > 0 && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>{t("{n} countries have no officer yet", { n: withoutOfficer.length })}</AlertTitle>
            <AlertDescription>
              <p>{t("A country cannot register anyone until its officer account exists. Create one:")}</p>
              <p className="mt-2 flex flex-wrap gap-1.5">
                {withoutOfficer.map((c) => (
                  <Link key={c.code} href={`/admin/users/new?country=${c.code}`} className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary">
                    + {pick(c.name, locale)}
                  </Link>
                ))}
              </p>
            </AlertDescription>
          </Alert>
        )}
        {sharedCountry.length > 0 && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>{t("More than one active officer for a country")}</AlertTitle>
            <AlertDescription>{t("Each country should have exactly one officer. Deactivate the extra account: {names}.", { names: sharedCountry.map((u) => u.name).join(", ") })}</AlertDescription>
          </Alert>
        )}

        {users.length === 0 ? (
          <EmptyState icon="id" title={t("No users yet")}>
            {t("Add one officer for each country.")}
          </EmptyState>
        ) : (
          <ItemList rows={rows} label={t("Users")} />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("What each role can do")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {assignableRoles.map((r) => (
                <div key={r} className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold">{t(roleLabels[r])}</dt>
                  <dd className="text-sm text-muted-foreground">{t(roleDescriptions[r])}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
      <MobileBarSpacer />
    </>
  );
}
