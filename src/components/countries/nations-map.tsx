import type { CSSProperties } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/data/types";
import { reveal } from "@/lib/animation/reveal";

/**
 * "Nine nations, one destination": the member capitals on a faint
 * graticule (equirectangular, 60°W–135°E, 50°N–35°S) with arcs that draw
 * in towards Luanda, then carry a travelling pulse. Positions are the real
 * capitals, nudged apart where flags would overlap (Gulf of Guinea, Cabo
 * Verde / Bissau).
 */
const W = 1170;
const H = 510;
const toXY = (lon: number, lat: number) => [((lon + 60) / 195) * W, ((50 - lat) / 85) * H] as const;

const PLACES: Record<string, { lon: number; lat: number; dx?: number; dy?: number }> = {
  AGO: { lon: 13.23, lat: -8.84 },
  BRA: { lon: -47.88, lat: -15.79 },
  CPV: { lon: -23.51, lat: 14.93, dx: -14, dy: -8 },
  GNB: { lon: -15.6, lat: 11.86, dx: 10, dy: 6 },
  GNQ: { lon: 8.78, lat: 3.75, dx: -8, dy: -16 },
  MOZ: { lon: 32.57, lat: -25.97 },
  PRT: { lon: -9.14, lat: 38.72 },
  STP: { lon: 6.73, lat: 0.34, dx: -30, dy: 10 },
  TLS: { lon: 125.57, lat: -8.56 },
};

export interface MapNation {
  code: string;
  name: string;
  flag?: ImageAsset;
}

export function NationsMap({ nations, hostLabel, caption }: { nations: MapNation[]; hostLabel: string; caption: string }) {
  const point = (code: string) => {
    const p = PLACES[code];
    if (!p) return null;
    const [x, y] = toXY(p.lon, p.lat);
    return [x + (p.dx ?? 0), y + (p.dy ?? 0)] as const;
  };
  const host = point("AGO")!;
  const arcs = nations
    .filter((n) => n.code !== "AGO" && point(n.code))
    .map((n, i) => {
      const [x, y] = point(n.code)!;
      const mx = (x + host[0]) / 2;
      const my = (y + host[1]) / 2;
      const lift = Math.hypot(host[0] - x, host[1] - y) * 0.28;
      return { code: n.code, i, d: `M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${host[0].toFixed(1)} ${host[1].toFixed(1)}` };
    });

  return (
    <figure className="nations-map relative m-0 mb-8 tablet:mb-9" {...reveal("fade")}>
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <g className="map-graticule">
            {Array.from({ length: 14 }, (_, k) => -60 + k * 15).map((lon) => {
              const [x] = toXY(lon, 0);
              return <line key={`lon${lon}`} x1={x} x2={x} y1={0} y2={H} />;
            })}
            {Array.from({ length: 6 }, (_, k) => 45 - k * 15).map((lat) => {
              const [, y] = toXY(0, lat);
              return <line key={`lat${lat}`} x1={0} x2={W} y1={y} y2={y} className={lat === 0 ? "map-equator" : undefined} />;
            })}
          </g>
          {arcs.map((a) => (
            <g key={a.code} style={{ "--arc-i": a.i } as CSSProperties}>
              <path className="map-arc" pathLength={1} d={a.d} />
              <path className="map-pulse" pathLength={1} d={a.d} />
            </g>
          ))}
          <circle className="map-host-ring" cx={host[0]} cy={host[1]} r={26} />
          <circle className="map-host-ring map-host-ring--late" cx={host[0]} cy={host[1]} r={26} />
        </svg>

        <ul className="m-0 list-none p-0">
          {nations.map((n, i) => {
            const p = point(n.code);
            if (!p) return null;
            const isHost = n.code === "AGO";
            return (
              <li
                key={n.code}
                className={isHost ? "map-pin map-pin--host" : "map-pin"}
                style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%`, "--pin-i": i } as CSSProperties}
              >
                <span className="map-flag block overflow-hidden rounded-pill" title={n.name}>
                  {n.flag ? (
                    <Image src={n.flag.src} alt={n.name} width={48} height={48} className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center type-caption font-bold">{n.code}</span>
                  )}
                </span>
                {isHost && <span className="map-host-label type-overline whitespace-nowrap">{hostLabel}</span>}
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="mt-3 type-caption text-fg-muted">{caption}</figcaption>
    </figure>
  );
}
