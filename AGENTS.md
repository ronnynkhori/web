# Agent handoff: XIII Jogos Desportivos da CPLP proposal site

Read this first. It explains what this repo is, who it is for, what is done and what to do next.

## The brief

- **Client contact:** Edgar Leandro (via WhatsApp).
- **Ask:** "Create a similar website [to maputo-2026-x8ni.vercel.app] with those logos. I need to present a proposal ... by Sunday. Just change the logos and mascot."
- **Event:** XIII Jogos Desportivos da CPLP (13th Games of the Community of Portuguese-Speaking Countries), **Angola 2027**, **25 March to 3 April 2027** in Luanda (confirmed by the client on 25 Oct 2026).
- **Partners (confirmed 25 Oct):** MINJUD (Ministério da Juventude e Desportos) is the **institutional partner**; Ondaka is the **official marketing and communications agency**. Both are seeded in `src/data/sponsors.ts`, shown in a slim strip right after the film (`partners-strip.tsx`) and as two large cards in the partners section at the bottom. No agency credit in the footer.
- **Deadline:** Sunday 25 October 2026 (the proposal presentation).
- **Origin:** This repo started as a selective copy of the owner's Maputo 2026 site (AUSC Region 5 Youth Games), rebranded. It is NOT linked to that repo or its Vercel project.

## Live

- **Site:** https://cplp-2027-proposta.vercel.app (Portuguese at `/pt`, English at `/en`).
- **Control Room:** https://cplp-2027-proposta.vercel.app/admin/login. Sign in with `admin@cplp2027.demo` / `CPLP-Angola-2027`. It is read-only because no database is connected.
- **Repo:** https://github.com/ronnynkhori/web (branch `master`; every push redeploys production).

## Stack

- Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind CSS v4, GSAP and motion for animation.
- Read `node_modules/next/dist/docs/` before changing Next APIs. This version has breaking changes, e.g. `proxy.ts` instead of middleware, and the `PageProps`/`LayoutProps` globals come from `next typegen`.
- Data: the Control Room (admin) stores content in Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Otherwise it uses a local JSON store in `.data/` (read-only on Vercel).
- Languages: **Portuguese (default, `/pt`) and English (`/en`)**. French was removed; the `Localized` type still tolerates a legacy `fr?` key (`src/lib/i18n/config.ts`).

## Commands

```bash
npm install
npm run dev          # http://localhost:3000 -> redirects to /pt
npm run typecheck    # run `npx next typegen` first on a fresh clone
npm run lint
npm run build
npm run brand        # rebuild web logos/mascot/icons from brand-assets/ (needs the PNGs)
npm run tokens       # rebuild src/styles/tokens.css from docs/design/design-tokens.json
```

- **Admin:** `/admin/login`. In dev, sign in with `admin@cplp2027.local` / `cplp2027`.
- **Demo the Games phases:** `/pt?phase=live` or `/pt?phase=post`, or `/pt?preview` for the switcher.

## Brand (from the client's brand pack)

- **`brand-assets/logomarca/`:** 12 logo PNGs (colour, white and black; horizontal and stacked; with and without "Angola 2027"). The `.ai`, `.eps` and `.pdf` vector originals are git-ignored because they are too large.
- **`brand-assets/ondaka/`:** Ondaka agency logos (horizontal colour, vertical gold/black, vertical on black). The brand script outputs `ondaka-h.png` and `ondaka-h-negative.png` (gold symbol, white wordmark) for the navy footer.
- **`brand-assets/minjud/`:** the MINJUD "36 Anos" logos rendered from the client's PDFs. The client asked to cut the "36 anos" mark; the brand script finds the divider line/rule and outputs `minjud-h.png` and `minjud-v.png` without it.
- **`public/audio/`:** the Games song "Pé no chão, voz no ar" (3:42, from Edgar, 128 kbps MP3) and its cover, played by `src/components/promo/song-player.tsx` under the film. The film and the song pause each other (`media-bus.ts`).
- **`public/videos/promo/`:** the official promo film with its song (69 s, from the client): `cplp-2027-filme-1080.mp4` (desktop), `-720.mp4` (phones), a silent 10 s `-preview.mp4` loop and a poster. Shown by `src/components/promo/` in the "Filme oficial" section right after the hero. Re-encode with ffmpeg (H.264, `-movflags +faststart`) if the client sends a new cut.
- **`brand-assets/Mascote/`:** 17 mascot PNGs. The mascot is the **galinha-capota (capota guineafowl)**, approved as the official mascot, in sports kit: neutral welcome/thumbs-up poses plus athletics, para athletics (wheelchair), 3x3 basketball, football, karate, taekwondo, tennis, beach volleyball and chess. The last two were extracted from the brand book (p.7, 376 px, mask recombined) because the ZIP did not include them.
- **`scripts/brand-assets.mjs`** turns these into web assets:
  - `public/images/brand/cplp-logo-*.png`, including `*-negative` (the brand book's negative version for dark backgrounds: white swooshes and wordmark, flags in colour). Do not mix colour swooshes with a white wordmark; the book allows no other variations.
  - `cplp-emblem.png`.
  - `public/images/mascot/*.png`.
  - `src/app/icon.png` and `apple-icon.png`.
- **Colours** are confirmed by the brand book (p.5) and live in `docs/design/design-tokens.json`:

  | Token | Hex |
  |---|---|
  | red | `#E21B1B` |
  | blue | `#1065E0` |
  | yellow | `#EFC100` |
  | ink | `#1E1E1E` |
  | navy (derived dark surface) | `#0A2A66` |

  Dark sections use navy, accents on dark are yellow, and light accents are red. See `src/styles/globals.css`.
- **Display font:** Kanit (the closest Google font to the wordmark). The UI font is Montserrat. The brand book names no typefaces.
- **Brand book:** `brand-assets/OFFICIAL BRAND XIII CPLP.pdf` (git-ignored; by the agency Ondaka, Sept 2026). It confirms "Angola, Março 2027", the red/blue/yellow hex values, the nine sports and the campaign tagline "Talento, união e desporto em Angola." It does not give the mascot name, host city or exact days.
- **Hero:** mascot-led (`src/components/hero/hero-stage.tsx`): the emblem's swooshes on navy plus the football, athletics and para-athletics mascots, as on the brand book's billboard. On phones, one mascot sits beside the title. `src/data/hero.ts` can still add a photo or video underneath.
- **Photos:** a new AI-generated, Angola-themed set (`public/images/demo/ao-*.jpg`, imported by `scripts/import-demo-images.mjs`). None of the Maputo photos remain.

## Where things live

- **Event facts:** `src/data/event.ts` (dates, countdown, story beats).
- **Countries:** `src/data/countries.ts` (the 9 CPLP members, flags in `public/images/flags/`).
- **Sports:** `src/data/sports.ts` (9 sports from the brand book, each with a `mascot` pose).
- **Mascot:** `src/data/mascot.ts` (pose registry).
- **Venues, news, FAQ, guide and media:** `src/data/venues.ts`, `news.ts`, `faq.ts`, `guide.ts`, `media.ts`, and `live-demo.ts` for demo scores.
- **UI copy:** `src/lib/i18n/messages/pt.ts` and `en.ts`. `pt` is typed against `en`, so add every key to both.
- **Home page section order:** `src/app/[locale]/page.tsx`.
- **New for CPLP:**
  - `src/components/mascot/` (mascot section with a pose switcher).
  - Mascot in the hero (`src/components/hero/hero.tsx`).
  - Mascot pose on each sport card (`src/components/sports/sport-card.tsx`).
- **Admin translations:** `src/lib/admin/i18n/catalog/*.ts` (English key to Portuguese).

## Confirmed by the client (Ondaka, 25 Oct 2026)

- **Dates:** 25 March to 3 April 2027 (10 days, `gamesDays = 10`).
- **Ceremonies:** opening at **Kilamba Arena** on 25 March; closing is a **luncheon at the CCB Futungo II Marquee** on 3 April.
- **Mascot:** the **galinha-capota** is the official mascot (statement and roles in `mascot.*` messages; the name-the-mascot poll was removed).
- **Venues, accommodation and participants per sport** (`src/data/sports.ts`, `venues.ts`; 840 participants in total):

 | Sport | Competition | Accommodation | Participants |
 |---|---|---|---|
 | Athletics (incl. para athletics) | Sayovo | Sayovo / Bengo | 192 |
 | 3x3 Basketball | Marginal | Ilha Mar | 112 |
 | Chess | Cidadela | Hotel Vila Alice | 40 |
 | Tennis | Kikuchi | Academia Diplomática | 56 |
 | Karate and taekwondo | Cidadela | Zongo / Vila Alice | 192 |
 | Football | AFA | Futungo | 184 |
 | Beach volleyball | Ilha | Ilha Mar | 64 |

## Provisional facts (flag these to the client)

- **Opening time:** 18:00 WAT is assumed (countdown target).
- **Full venue names:** "Sayovo", "Kikuchi" and "AFA" are as written in the client's table.
- **Days per sport, Cultural Night (30 Mar), quotas and eligibility:** proposals inside the confirmed dates.
- **Photos:** AI-generated demo images, not event photography.

## Status (update this list as you work)

- [x] New repo, brand assets processed, colours, fonts, logos and icons swapped.
- [x] PT default plus EN; all Maputo/AUSC copy replaced with CPLP/Angola 2027.
- [x] 9 CPLP countries and flags; 9 sports with mascot poses; venues, news, FAQ, guide and live demo rewritten.
- [x] Brand book applied: March 2027, official tagline, beach volleyball and chess, confirmed colours.
- [x] Own look, not a Maputo copy: mascot-led hero with brand swooshes, and a new Angola-themed photo set everywhere (including the admin login).
- [x] Mascot section, hero mascot, sport-card mascots, admin login and sidebar rebranded.
- [x] Vercel project `cplp-2027-proposta` (team `ronnynkhoris-projects`), connected to GitHub `ronnynkhori/web`. **Every push to `master` deploys production automatically.** `maputo-2026-x8ni` is untouched.
  - Production env vars set: `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL=admin@cplp2027.demo`, `ADMIN_PASSWORD=CPLP-Angola-2027`.
  - No Supabase, so the Control Room is read-only on Vercel. That is fine for the demo; add Supabase from the Vercel Marketplace to make it editable.
  - Vercel CLI on the owner's PC needs `$env:NODE_OPTIONS='--use-system-ca'` because of a TLS proxy.
- [x] Hero rebuilt as a split stage: nine-flag arch over the mascot trio. Countdown fits the first screen at 360x640 to 1920x1080 (`lowphone`/`short`/`squat`/`tall` variants in `globals.css`).
- [x] Visual pass (`src/styles/spice.css`):
  - swoosh edges on the navy bands (`components/ui/swoosh-edge.tsx`, `Section swoosh`);
  - nations map with arcs to Luanda (`components/countries/nations-map.tsx`);
  - yellow count-up stats band;
  - mascot cameos and the footer farewell;
  - Sona texture (`sona-bg`, to validate with the client);
  - venue photo brand scrim;
  - confetti on mascot taps;
  - sport-card tilt;
  - name-the-mascot demo poll.
- [x] The tricolour "ribbon" (`.torch-stripe`) is a solid wave band. The client rejected the block stripe, the gapped waves, animated ribbons and the kinetic marquee.
- [x] Share card (`src/app/[locale]/opengraph-image.tsx`) uses Kanit/Montserrat TTFs from `src/assets/fonts/`.
- [x] Client update (25 Oct): confirmed dates and ceremony venues, galinha-capota copy, venues/accommodation/participants per sport, promo film section, Ondaka footer credit.
- [ ] Visual QA on mobile and desktop (`/pt`, `/en`, `/pt/sports/football`, `/pt/schedule`, `/admin/login`).
- [x] Partners section (MINJUD institutional partner, Ondaka agency), Games song player, Next.js upgraded to 16.4.3 (16.4.0 had critical advisories).
- [ ] Still to get from the client: opening time and full venue names.
- [ ] Nice to have: a mascot-led 404 page, a mascot in the assistant button, and a short proposal summary page.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
