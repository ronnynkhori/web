import type { MetadataRoute } from "next";
import designTokens from "../../docs/design/design-tokens.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XIII Jogos Desportivos da CPLP, Angola 2027",
    short_name: "CPLP 2027",
    start_url: "/",
    display: "standalone",
    background_color: designTokens.color.brand.navy.value,
    theme_color: designTokens.color.brand.navy.value,
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
