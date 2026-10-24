# Agent handoff: XIII Jogos Desportivos da CPLP proposal site

Read this first. It explains what this repo is, who it is for, what is done and what to do next.

## The brief

- **Client contact:** Edgar Leandro (via WhatsApp).
- **Ask:** "Create a similar website [to maputo-2026-x8ni.vercel.app] with those logos. I need to present a proposal ... by Sunday. Just change the logos and mascot."
- **Event:** XIII Jogos Desportivos da CPLP (13th Games of the Community of Portuguese-Speaking Countries), **Angola 2027**. The dated logo variants confirm "Angola 2027".
- **Deadline:** Sunday 25 October 2026 (the proposal presentation).
- **Origin:** This repo started as a selective copy of the owner's Maputo 2026 site (AUSC Region 5 Youth Games), rebranded. It is NOT linked to that repo or its Vercel project.

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
- **`brand-assets/Mascote/`:** 15 mascot PNGs. The mascot is a **guinea fowl (galinha-d'angola)** in sports kit: neutral welcome/thumbs-up poses plus athletics, para athletics (wheelchair), 3x3 basketball, football, karate, taekwondo and tennis.
- **`scripts/brand-assets.mjs`** turns these into web assets:
  - `public/images/brand/cplp-logo-*.png`, including `*-reversed` (colour emblem with a white wordmark, for dark backgrounds).
  - `cplp-emblem.png`.
  - `public/images/mascot/*.png`.
  - `src/app/icon.png` and `apple-icon.png`.
- **Colours** were sampled from the emblem and live in `docs/design/design-tokens.json`:

  | Token | Hex |
  |---|---|
  | red | `#E21B1B` |
  | blue | `#1065E0` |
  | yellow | `#EFC100` |
  | ink | `#1E1E1E` |
  | navy (derived dark surface) | `#0A2A66` |

  Dark sections use navy, accents on dark are yellow, and light accents are red. See `src/styles/globals.css`.
- **Display font:** Kanit (the closest Google font to the wordmark). The UI font is Montserrat.
- **NOT YET RECEIVED:** `OFFICIAL BRAND XIII CPLP.pdf` (14 pages, sent on WhatsApp). When it arrives, check the official hex values, fonts, mascot name and story, and the host city and dates, then update the tokens and copy.

## Where things live

- **Event facts:** `src/data/event.ts` (dates, countdown, story beats).
- **Countries:** `src/data/countries.ts` (the 9 CPLP members, flags in `public/images/flags/`).
- **Sports:** `src/data/sports.ts` (7 sports, each with a `mascot` pose).
- **Mascot:** `src/data/mascot.ts` (pose registry).
- **Venues, news, FAQ, guide and media:** `src/data/venues.ts`, `news.ts`, `faq.ts`, `guide.ts`, `media.ts`, and `live-demo.ts` for demo scores.
- **UI copy:** `src/lib/i18n/messages/pt.ts` and `en.ts`. `pt` is typed against `en`, so add every key to both.
- **Home page section order:** `src/app/[locale]/page.tsx`.
- **New for CPLP:**
  - `src/components/mascot/` (mascot section with a pose switcher).
  - Mascot in the hero (`src/components/hero/hero.tsx`).
  - Mascot pose on each sport card (`src/components/sports/sport-card.tsx`).
- **Admin translations:** `src/lib/admin/i18n/catalog/*.ts` (English key to Portuguese).

## Provisional facts (flag these to the client)

- **Host city:** Luanda (assumed). Only "Angola 2027" is confirmed.
- **Dates:** 17–25 July 2027 (placeholder; the countdown targets 17 July 18:00 WAT).
- **Venues:** proposals only (Estádio 11 de Novembro, Pavilhão da Cidadela, Estádio dos Coqueiros, Marginal de Luanda, Clube de Ténis de Luanda).
- **Mascot name:** unknown. The mascot section says "galinha-d'angola" with a `[CLIENT TO CONFIRM]` flag, which is visible only with `?review=1`.
- **Photos:** generic Unsplash/AI demo images (`public/images/demo`), not event photography.

## Status (update this list as you work)

- [x] New repo, brand assets processed, colours, fonts, logos and icons swapped.
- [x] PT default plus EN; all Maputo/AUSC copy replaced with CPLP/Angola 2027.
- [x] 9 CPLP countries and flags; 7 sports with mascot poses; venues, news, FAQ, guide and live demo rewritten.
- [x] Mascot section, hero mascot, sport-card mascots, admin login and sidebar rebranded.
- [ ] Deploy to a NEW Vercel project (do not touch `maputo-2026-x8ni`) and send the client the URL.
- [ ] Visual QA on mobile and desktop (`/pt`, `/en`, `/pt/sports/football`, `/pt/schedule`, `/admin/login`).
- [ ] When the brand PDF arrives: exact colours, fonts, mascot name, city and dates.
- [ ] Nice to have: a mascot-led 404 page, a mascot in the assistant button, and a short proposal summary page.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
