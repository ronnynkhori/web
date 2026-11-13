import { signOutDelegation } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import type { Locale } from "@/lib/i18n/config";

export function OfficerBar({ locale }: { locale: Locale }) {
  const copy = regCopy(locale);
  const item = "type-label text-fg-2 hover:text-fg";
  return (
    <div className="sticky top-(--header-h) z-20 border-b border-line bg-surface-raised">
      <div className="container-wide flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
        <a className={item} href={`/${locale}/delegation`}>
          {copy.dashboard}
        </a>
        <a className={item} href={`/${locale}/delegation/profile`}>
          {copy.profile}
        </a>
        <a className={item} href={`/${locale}/delegation/participants/new?kind=athlete`}>
          {copy.newAthlete}
        </a>
        <a className={item} href={`/${locale}/delegation/participants/new?kind=official`}>
          {copy.newOfficial}
        </a>
        <a className={item} href={`/api/registration/export`}>
          {copy.exportExcel}
        </a>
        <a className={item} href={`/${locale}/delegation/print`}>
          {copy.exportPdf}
        </a>
        <form action={signOutDelegation} className="ml-auto">
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={item}>
            {copy.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
