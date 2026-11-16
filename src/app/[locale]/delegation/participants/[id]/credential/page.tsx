import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/registration/print-button";
import { PageTitle } from "@/components/registration/portal/page-title";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";

export default async function CredentialPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { people, files } = await delegationContext(locale);
  const person = people.find((item) => item.id === id && item.status === "approved" && item.registrationNumber);
  if (!person) notFound();
  const photo = files.find((file) => file.participantId === person.id && file.kind === "photo" && file.id.startsWith("file-"));
  const svg = await QRCode.toString(person.registrationNumber, { type: "svg", margin: 0, width: 132, color: { dark: "#1E1E1E", light: "#FFFFFF" } });
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const country = countries.find((item) => item.code === person.countryCode);
  const sport = sports.find((item) => item.id === person.sportId);
  const role = person.kind === "athlete" ? copy.athlete : person.function ? copy.functions[person.function] : copy.official;
  return (
    <div className="container-page flex flex-col gap-6 py-6 tablet:py-7 print:py-0">
      <div className="print:hidden">
        <PageTitle back={{ href: `/${locale}/delegation/participants/${person.id}`, label: person.fullName }} title={copy.credential} actions={<PrintButton label={copy.exportPdf} />} />
        <p className="m-0 mt-3 max-w-prose type-body-s text-fg-muted">{copy.credentialHelp}</p>
      </div>
      <article className="mx-auto w-full max-w-sm overflow-hidden rounded-md border border-line bg-surface-raised shadow-lg print:shadow-none">
        <header data-theme="dark" className="relative flex items-center gap-3 bg-surface px-5 pt-5 pb-4 text-fg">
          <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="size-[2.75rem] rounded-xs bg-white p-0.5" />
          <div className="flex flex-col">
            <span className="type-overline text-accent">XIII Jogos da CPLP</span>
            <span className="font-display text-xl leading-none uppercase">Angola 2027</span>
          </div>
          <div aria-hidden="true" className="torch-stripe absolute inset-x-0 bottom-0 h-1.5" />
        </header>
        <div className="flex gap-4 p-5">
          <span className="relative block h-36 w-28 shrink-0 overflow-hidden rounded-xs bg-surface-overlay">
            {photo && (
              // The image optimizer would request this private file without the session cookie.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/registration/file/${photo.id}`} alt="" className="size-full object-cover" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="m-0 font-display text-xl leading-tight uppercase">{person.fullName}</p>
            <p className="m-0 type-body-s font-semibold">{role}</p>
            {sport && <p className="m-0 type-caption text-fg-2">{pick(sport.name, locale)}</p>}
            <p className="m-0 flex items-center gap-2 type-caption font-bold">
              {country?.flag && <Image src={country.flag.src} alt="" width={30} height={20} className="h-4 w-6 rounded-[2px] object-cover ring-1 ring-line" />}
              {country ? pick(country.name, locale) : person.countryCode}
            </p>
          </div>
        </div>
        <footer className="flex items-end justify-between gap-4 border-t border-line px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="type-caption text-fg-muted">{copy.registrationNumber}</span>
            <span className="font-data text-lg font-bold tracking-wide">{person.registrationNumber}</span>
            <span className="type-caption text-fg-muted">{p.approvedTitle}</span>
          </div>
          <div className="size-[132px] shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
        </footer>
      </article>
    </div>
  );
}
