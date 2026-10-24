import Image from "next/image";
import type { ImageAsset } from "@/data/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const tilt = ["-rotate-3 translate-x-2 desktop:-rotate-6 desktop:translate-x-3", "z-raised", "rotate-3 -translate-x-2 desktop:rotate-6 desktop:-translate-x-3"];

/**
 * "Download your photos" card. Originals live on the external photo gallery
 * (Pixieset); this card explains the three steps and links out.
 */
export function PhotoDownloads({
  href,
  labels,
  images,
  links = [],
}: {
  href: string | null;
  labels: Dictionary["media"];
  images: ImageAsset[];
  /** Per-day and per-sport galleries added in the Control Room. */
  links?: Array<{ id: string; label: string; url: string }>;
}) {
  return (
    <div
      data-theme="dark"
      className="mt-7 grid items-center gap-6 overflow-hidden rounded-sm bg-surface p-5 text-fg tablet:p-7 desktop:grid-cols-12 desktop:gap-8"
    >
      <div aria-hidden="true" className="flex justify-center px-3 py-4 desktop:col-span-5">
        {images.map((image, i) => (
          <div
            key={image.src}
            className={`relative aspect-[4/5] w-[28%] max-w-[12rem] shrink-0 overflow-hidden rounded-xs border-2 desktop:border-4 border-surface-raised shadow-lg ${tilt[i] ?? ""}`}
          >
            <Image src={image.src} alt="" fill sizes="(min-width: 64rem) 12rem, 30vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 desktop:col-span-7">
        <p className="m-0 flex items-center gap-2 type-overline text-accent">
          <Icon name="camera" size={16} />
          {labels.getPhotos}
        </p>
        <h3 className="m-0 type-display-m">{labels.getPhotosTitle}</h3>
        <p className="m-0 max-w-[60ch] type-body-m text-fg-2">{labels.getPhotosBody}</p>
        <ol className="m-0 grid list-none gap-3 p-0 tablet:grid-cols-3">
          {labels.getPhotosSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 type-label">
              <span className="grid size-touch shrink-0 place-items-center rounded-pill border border-line-accent type-data-m text-accent tabular">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {href ? (
          <Button href={href} external variant="cta" icon="external" className="self-start">
            {labels.getPhotosCta}
          </Button>
        ) : (
          <p className="m-0 self-start rounded-pill border border-line px-4 py-2 type-label text-fg-muted">{labels.getPhotosSoon}</p>
        )}
        {links.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <p className="m-0 type-overline text-fg-muted">{labels.photoGalleries}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-touch items-center gap-2 rounded-pill border border-line-strong px-4 type-label hover:border-line-accent"
                  >
                    {link.label}
                    <Icon name="external" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
