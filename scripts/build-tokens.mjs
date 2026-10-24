#!/usr/bin/env node
/**
 * Token pipeline: docs/design/design-tokens.json -> src/styles/tokens.css
 *
 * The JSON file is authoritative. This script flattens it into CSS custom
 * properties (prefix --tk-) and resolves {alias.references} into var() calls.
 * src/styles/globals.css then maps the semantic subset into Tailwind's @theme.
 *
 * Run: npm run tokens   (also runs automatically before dev/build)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "docs/design/design-tokens.json");
const OUT = resolve(root, "src/styles/tokens.css");

const tokens = JSON.parse(readFileSync(SRC, "utf8"));
const lines = [];

const kebab = (s) => String(s).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_.]+/g, "-").toLowerCase();
const ref = (path) => `var(--tk-${path.split(".").map(kebab).join("-")})`;

/** Resolve "{color.brand.black}" into var(--tk-color-brand-black). */
function resolveValue(v) {
  if (typeof v !== "string") return String(v);
  return v.replace(/\{([^}]+)\}/g, (_, p) => ref(p));
}

function emit(name, value) {
  lines.push(`  --tk-${name}: ${resolveValue(value)};`);
}

/* ---------- colour ---------- */
const { color } = tokens;
for (const [group, entries] of Object.entries(color)) {
  for (const [key, def] of Object.entries(entries)) {
    if (key === "note" || typeof def !== "object") continue;
    const base = `color-${kebab(group)}-${kebab(key)}`;
    if ("value" in def) emit(base, def.value);
    // Compound tokens: action.primary.text, state.live.bg, etc.
    for (const sub of ["bg", "text", "border"]) {
      if (sub in def) emit(`${base}-${sub}`, def[sub]);
    }
  }
}

/* ---------- typography ---------- */
const { typography } = tokens;
for (const [key, def] of Object.entries(typography.family)) emit(`font-${kebab(key)}`, def.value);
for (const [key, val] of Object.entries(typography.weight)) emit(`font-weight-${kebab(key)}`, val);
for (const [key, def] of Object.entries(typography.scale)) {
  const base = `type-${kebab(key)}`;
  emit(`${base}-size`, def.size);
  emit(`${base}-line-height`, def.lineHeight);
  emit(`${base}-letter-spacing`, def.letterSpacing ?? "0");
  emit(`${base}-weight`, def.weight ?? 400);
  emit(`${base}-family`, ref(`font.${def.family}`));
  emit(`${base}-transform`, def.case === "upper" ? "uppercase" : "none");
}

/* ---------- spacing ---------- */
for (const [key, val] of Object.entries(tokens.spacing.scale)) emit(`space-${key}`, val);
for (const [key, val] of Object.entries(tokens.spacing.section)) {
  emit(`space-section-${key}`, val.replace(/\{spacing\.scale\.(\d+)\}/, "{space.$1}"));
}

/* ---------- radius / border / shadow ---------- */
for (const [key, val] of Object.entries(tokens.radius)) {
  if (typeof val === "string" && key !== "rule") emit(`radius-${kebab(key)}`, val);
}
for (const [key, val] of Object.entries(tokens.border)) emit(`border-${kebab(key)}`, val);
for (const [key, val] of Object.entries(tokens.shadow)) {
  if (key !== "rule") emit(`shadow-${kebab(key)}`, val);
}

/* ---------- opacity / z-index ---------- */
for (const [key, val] of Object.entries(tokens.opacity)) emit(`opacity-${kebab(key)}`, val);
for (const [key, val] of Object.entries(tokens.zIndex)) emit(`z-${kebab(key)}`, val);

/* ---------- motion ---------- */
const { motion } = tokens;
for (const [key, val] of Object.entries(motion.duration)) emit(`duration-${kebab(key)}`, val);
for (const [key, val] of Object.entries(motion.easing)) emit(`ease-${kebab(key)}`, val);
for (const [key, val] of Object.entries(motion.stagger)) emit(`stagger-${kebab(key)}`, val);
for (const [key, val] of Object.entries(motion.distance)) emit(`distance-${kebab(key)}`, val);

/* ---------- layout ---------- */
const { layout } = tokens;
for (const [key, val] of Object.entries(layout.maxWidth)) {
  if (!val.startsWith("none")) emit(`max-width-${kebab(key)}`, val);
}
for (const [bp, def] of Object.entries(layout.grid)) {
  emit(`grid-${bp}-columns`, def.columns);
  emit(`grid-${bp}-gutter`, def.gutter);
  if (!def.margin.startsWith("auto")) emit(`grid-${bp}-margin`, def.margin);
}
emit("touch-min", layout.touchTarget.min);
emit("touch-preferred", layout.touchTarget.preferred);
emit("header-height-mobile", layout.headerHeight.mobile);
emit("header-height-desktop", layout.headerHeight.desktop);

/* ---------- breakpoints (reference only; CSS vars cannot drive @media) ---------- */
for (const [key, def] of Object.entries(tokens.breakpoints)) emit(`breakpoint-${key}`, def.min);

/* ---------- pattern ---------- */
const stripe = tokens.pattern["torch-stripe"];
emit("pattern-stripe-gap", stripe.gap);
stripe.stripeWidth.forEach((w, i) => emit(`pattern-stripe-width-${i + 1}`, w));

/* ---------- typography utilities (Tailwind v4 @utility) ---------- */
const OUT_TYPE = resolve(root, "src/styles/typography.css");
const typeUtilities = Object.entries(typography.scale).map(([key, def]) => {
  const b = `--tk-type-${kebab(key)}`;
  const decl = [
    `  font-family: var(${b}-family);`,
    `  font-size: var(${b}-size);`,
    `  line-height: var(${b}-line-height);`,
    `  letter-spacing: var(${b}-letter-spacing);`,
    `  font-weight: var(${b}-weight);`,
    `  text-transform: var(${b}-transform);`,
  ];
  if (def.feature === "tabular-nums" || def.family === "data") decl.push("  font-variant-numeric: tabular-nums;");
  if (def.color) decl.push(`  color: ${resolveValue(def.color)};`);
  return `@utility type-${kebab(key)} {\n${decl.join("\n")}\n}`;
});
writeFileSync(
  OUT_TYPE,
  `/* AUTO-GENERATED by scripts/build-tokens.mjs - DO NOT EDIT BY HAND. One utility per typography.scale step. */\n${typeUtilities.join("\n\n")}\n`,
);
console.log(`tokens: wrote ${typeUtilities.length} type utilities -> ${OUT_TYPE.replace(root, ".")}`);

const header = `/*
 * AUTO-GENERATED by scripts/build-tokens.mjs - DO NOT EDIT BY HAND.
 * Source: docs/design/design-tokens.json (${tokens.meta.status})
 * Components must consume semantic tokens via src/styles/globals.css (@theme),
 * never --tk-color-brand-* or --tk-color-neutral-* directly.
 */
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${header}:root {\n${lines.join("\n")}\n}\n`);
console.log(`tokens: wrote ${lines.length} custom properties -> ${OUT.replace(root, ".")}`);
