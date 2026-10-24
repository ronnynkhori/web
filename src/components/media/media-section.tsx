import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { getMedia, getPhotoLinks, getSettings } from "@/lib/cms/read";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { MediaGallery } from "./media-gallery";
import { PhotoDownloads } from "./photo-downloads";

/** Gallery (#media): "Today in photos" - swipe row on phones, masonry on desktop. */
export async function MediaSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const m = dict.media;
  const [media, links, settings] = await Promise.all([getMedia(), getPhotoLinks(), getSettings()]);
  const downloadsUrl = settings.photoDownloadsUrl || null;
  return (
    <Section id="media" labelledBy="media-title" band="alt">
      <SectionHeader
        id="media-title"
        overline={m.title}
        title={m.strip}
      />
      <MediaGallery
        items={media.map((x) => ({
          id: x.id,
          type: x.type,
          title: pick(x.title, locale),
          ratio: x.ratio,
          image: x.image,
          alt: x.image ? pick(x.image.alt, locale) : "",
          credit: x.image?.credit || x.credit || undefined,
        }))}
        labels={m}
        downloadsUrl={downloadsUrl}
      />
      <PhotoDownloads
        href={downloadsUrl}
        labels={m}
        images={media.filter((x) => x.type === "photo" && x.image).slice(0, 3).map((x) => x.image!)}
        links={links.map((l) => ({ id: l.id, label: pick(l.label, locale), url: l.url }))}
      />
    </Section>
  );
}
