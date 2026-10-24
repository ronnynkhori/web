import { getSettings } from "@/lib/cms/read";
import { pick, type Locale } from "@/lib/i18n/config";
import { BannerBar } from "./banner-bar";

/** Control Room alert (delays, venue changes). Hidden unless switched on. */
export async function SiteBanner({ locale, closeLabel }: { locale: Locale; closeLabel: string }) {
  const { banner } = await getSettings();
  const message = pick(banner.message, locale);
  if (!banner.enabled || !message) return null;
  return (
    <BannerBar
      level={banner.level}
      message={message}
      href={banner.href || null}
      linkLabel={banner.linkLabel ? pick(banner.linkLabel, locale) : ""}
      closeLabel={closeLabel}
    />
  );
}
