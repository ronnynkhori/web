import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { isLocale } from "@/lib/i18n/config";

export default async function CredentialPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { people, files } = await delegationContext(locale);
  const person = people.find((item) => item.id === id && item.status === "approved" && item.registrationNumber);
  if (!person) notFound();
  const photo = files.find((file) => file.participantId === person.id && file.kind === "photo");
  const svg = await QRCode.toString(person.registrationNumber, { type: "svg", margin: 1, width: 180 });
  const copy = regCopy(locale);
  return (
    <section className="container-wide flex flex-col gap-4 py-8">
      <h1 className="m-0 type-display-m">{copy.credential}</h1>
      <p className="m-0 max-w-prose type-body-s text-fg-muted">{copy.credentialHelp}</p>
      <div className="flex max-w-md flex-col gap-3 rounded-sm border border-line p-5">
        {photo && (
          // The image optimizer would request this private file without the session cookie.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/registration/file/${photo.id}`} alt="" className="h-40 w-32 object-cover" />
        )}
        <p className="m-0 type-heading-s">{person.fullName}</p>
        <p className="m-0 type-label">
          {copy.registrationNumber}: {person.registrationNumber}
        </p>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </section>
  );
}
