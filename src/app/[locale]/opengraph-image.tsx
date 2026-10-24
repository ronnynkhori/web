import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import designTokens from "../../../docs/design/design-tokens.json";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const alt = "XIII Jogos Desportivos da CPLP, Angola 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const dataUri = async (file: string) =>
  `data:image/png;base64,${(await readFile(join(process.cwd(), "public/images", file))).toString("base64")}`;

/** Share card: the dated logo on white, the mascot, and the title on navy. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(isLocale(locale) ? locale : "pt");
  const [logo, mascot] = await Promise.all([dataUri("brand/cplp-logo-stacked-date.png"), dataUri("mascot/mascote-1.png")]);
  const { navy, red, blue, yellow } = designTokens.color.brand;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: navy.value, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 430, background: "white" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={330} height={387} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24, flex: 1, padding: "0 48px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", width: 72, height: 8, background: red.value }} />
            <div style={{ display: "flex", width: 72, height: 8, background: blue.value }} />
            <div style={{ display: "flex", width: 72, height: 8, background: yellow.value }} />
          </div>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>{dict.meta.title}</div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>{dict.hero.tagline}</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascot} alt="" width={250} height={315} style={{ position: "absolute", right: 24, bottom: 0 }} />
      </div>
    ),
    size,
  );
}
