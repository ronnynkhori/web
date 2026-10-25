import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import designTokens from "../../../docs/design/design-tokens.json";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { countries } from "@/data/countries";

export const alt = "XIII Jogos Desportivos da CPLP, Angola 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const asset = async (file: string, mime = "image/png") =>
  `data:${mime};base64,${(await readFile(join(process.cwd(), "public/images", file))).toString("base64")}`;

/** Flag arch over the trio, as in the hero: 200deg to 340deg around the stage centre. */
const STAGE = { cx: 905, cy: 360, r: 250 };
const archPoint = (i: number, n: number) => {
  const a = ((200 + (140 * i) / (n - 1)) * Math.PI) / 180;
  return { x: STAGE.cx + STAGE.r * Math.cos(a), y: STAGE.cy + STAGE.r * Math.sin(a) };
};

/** Share card (WhatsApp, social): the hero in one frame: title on navy, flag arch, mascot trio, tricolour ribbon. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(isLocale(locale) ? locale : "pt");
  const { navy, red, blue, yellow } = designTokens.color.brand;
  const [logo, lead, left, right, ...flags] = await Promise.all([
    asset("brand/cplp-logo-h-negative.png"),
    asset("mascot/atletismo-1.png"),
    asset("mascot/futebol-1.png"),
    asset("mascot/atletismo-com-deficiencia-1.png"),
    ...countries.map((c) => asset(`flags/${c.code.toLowerCase()}.svg`, "image/svg+xml")),
  ]);
  const font = (file: string) => readFile(join(process.cwd(), "src/assets/fonts", file));
  const [kanit, montserrat, montserratBold] = await Promise.all([font("kanit-800.ttf"), font("montserrat-500.ttf"), font("montserrat-800.ttf")]);
  const FLAG = 66;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          color: "white",
          fontFamily: "Montserrat",
          background: `radial-gradient(circle at 76% 55%, ${blue.value} 0%, ${navy.value} 58%)`,
        }}
      >
        {/* Rings behind the stage */}
        <div
          style={{
            position: "absolute",
            left: STAGE.cx - STAGE.r - 30,
            top: STAGE.cy - STAGE.r - 30,
            width: (STAGE.r + 30) * 2,
            height: (STAGE.r + 30) * 2,
            borderRadius: 9999,
            border: "2px solid rgba(255,255,255,0.14)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: STAGE.cx - STAGE.r + 40,
            top: STAGE.cy - STAGE.r + 40,
            width: (STAGE.r - 40) * 2,
            height: (STAGE.r - 40) * 2,
            borderRadius: 9999,
            border: "2px dashed rgba(255,255,255,0.2)",
            display: "flex",
          }}
        />

        {/* Copy */}
        <div style={{ position: "absolute", left: 64, top: 56, width: 560, display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={290} height={90} />
          <div style={{ display: "flex", marginTop: 34, fontSize: 32, fontWeight: 600, opacity: 0.85 }}>XIII Jogos Desportivos da CPLP</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 10, fontFamily: "Kanit", fontSize: 128, fontWeight: 800, lineHeight: 0.92 }}>
            <span>ANGOLA</span>
            <span style={{ color: yellow.value }}>2027</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, opacity: 0.85 }}>{dict.hero.tagline}</div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 30, fontWeight: 800, textTransform: "uppercase" }}>{dict.hero.dates}</div>
        </div>

        {/* Flag arch */}
        {flags.map((src, i) => {
          const p = archPoint(i, flags.length);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              width={FLAG}
              height={FLAG}
              style={{
                position: "absolute",
                left: p.x - FLAG / 2,
                top: p.y - FLAG / 2,
                borderRadius: 9999,
                objectFit: "cover",
                border: "4px solid white",
                boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
              }}
            />
          );
        })}

        {/* Mascot trio on a ground shadow */}
        <div
          style={{
            position: "absolute",
            left: STAGE.cx - 190,
            top: 572,
            width: 380,
            height: 34,
            borderRadius: 9999,
            background: "radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))",
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={left} alt="" width={198} height={260} style={{ position: "absolute", left: STAGE.cx - 270, top: 330 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={right} alt="" width={218} height={240} style={{ position: "absolute", left: STAGE.cx + 70, top: 350 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lead} alt="" width={273} height={360} style={{ position: "absolute", left: STAGE.cx - 140, top: 228 }} />
        <div
          style={{
            position: "absolute",
            left: STAGE.cx - 170,
            top: 178,
            width: 340,
            display: "flex",
            justifyContent: "center",
            padding: "10px 0",
            borderRadius: 10,
            background: "white",
            color: navy.value,
            whiteSpace: "nowrap",
            fontSize: 21,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {dict.hero.bubble}
        </div>

        {/* Tricolour ribbon */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 7, background: red.value }} />
          <div style={{ display: "flex", height: 7, background: yellow.value }} />
          <div style={{ display: "flex", height: 7, background: blue.value }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Kanit", data: kanit, weight: 800, style: "normal" },
        { name: "Montserrat", data: montserrat, weight: 500, style: "normal" },
        { name: "Montserrat", data: montserratBold, weight: 800, style: "normal" },
      ],
    },
  );
}
