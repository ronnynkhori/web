import type { MetadataRoute } from "next";
import { legalSlugs } from "@/data/legal";
import { sports } from "@/data/sports";
import { getAnnouncements } from "@/lib/cms/read";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entry = (path: string, priority: number, changeFrequency: Frequency): MetadataRoute.Sitemap[number] => ({
    url: `${base}/en${path}`,
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])) },
  });
  const announcements = await getAnnouncements();
  return [
    entry("", 1, "daily"),
    entry("/results", 0.9, "hourly"),
    entry("/schedule", 0.8, "daily"),
    entry("/news", 0.8, "daily"),
    entry("/sports", 0.7, "weekly"),
    ...sports.map((s) => entry(`/sports/${s.id}`, 0.6, "daily")),
    ...announcements.map((a) => entry(`/news/${a.id}`, 0.5, "weekly")),
    ...legalSlugs.map((slug) => entry(`/${slug}`, 0.3, "monthly")),
  ];
}
