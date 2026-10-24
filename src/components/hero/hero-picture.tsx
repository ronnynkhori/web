import { getImageProps } from "next/image";
import type { ImageAsset } from "@/data/types";

/**
 * Art-directed hero still (the LCP element): landscape from tablet up,
 * portrait on phones. One <picture>, so the browser downloads only the
 * source that matches - never both.
 */
export function HeroPicture({ desktop, mobile }: { desktop: ImageAsset; mobile?: ImageAsset | null }) {
  const common = { alt: "", sizes: "100vw", fill: true, loading: "eager", fetchPriority: "high" } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: desktop.src });
  const {
    props: { srcSet: narrow, ...img },
  } = getImageProps({ ...common, src: (mobile ?? desktop).src });

  return (
    <picture>
      <source media="(min-width: 40rem)" srcSet={wide} sizes="100vw" />
      <source srcSet={narrow} sizes="100vw" />
      <img {...img} alt="" className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}
