#!/usr/bin/env node
/**
 * Role access check for the Games Control Room (local store, dev server only).
 *
 *   node scripts/test-roles.mjs [baseUrl]            adds test users, runs the matrix, removes them
 *   node scripts/test-roles.mjs [baseUrl] --keep     leaves the test users so you can log in by hand
 *
 * Test users log in with password "Test-2026!". Sessions are signed with the
 * development secret, so this only works against `next dev` without ADMIN_SESSION_SECRET.
 */
import { createHmac, randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const base = (process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3002").replace(/\/$/, "");
const keep = process.argv.includes("--keep");
const FILE = ".data/store.json";
const SECRET = "dev-only-games-control-room-secret-change-me";
const PASSWORD = "Test-2026!";

const testUsers = [
  { id: "test-editor", role: "editor", sportIds: [] },
  { id: "test-media", role: "media", sportIds: [] },
  { id: "test-results", role: "results", sportIds: [] },
  { id: "test-scorer", role: "scorer", sportIds: ["basketball"] },
];

const access = {
  dashboard: ["super", "editor", "media", "results", "scorer"],
  announcements: ["super", "editor"],
  documents: ["super", "editor"],
  faq: ["super", "editor"],
  guide: ["super", "editor"],
  venues: ["super", "editor"],
  countries: ["super", "editor", "results"],
  sponsors: ["super", "editor"],
  schedule: ["super", "editor", "results"],
  settings: ["super", "editor"],
  media: ["super", "media"],
  photoLinks: ["super", "media"],
  users: ["super"],
  activity: ["super", "results"],
  scores: ["super", "results", "scorer"],
  results: ["super", "results", "scorer"],
  approvals: ["super", "results"],
  medals: ["super", "results"],
};

const collections = ["announcements", "documents", "media", "photoLinks", "sponsors", "faq", "guide", "venues", "countries", "schedule"];
const pages = [
  ["/admin", "dashboard"],
  ...collections.map((c) => [`/admin/c/${c}`, c]),
  ["/admin/c/announcements/new", "announcements"],
  ["/admin/settings", "settings"],
  ["/admin/users", "users"],
  ["/admin/activity", "activity"],
  ["/admin/scores", "scores"],
  ["/admin/results", "results"],
  ["/admin/approvals", "approvals"],
  ["/admin/medals", "medals"],
];

const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
};
const cookieFor = (email, role, sportIds) => {
  const payload = Buffer.from(JSON.stringify({ email, name: `Test ${role}`, role, sportIds, exp: Date.now() + 3_600_000 })).toString("base64url");
  return `gcr_session=${payload}.${createHmac("sha256", SECRET).update(payload).digest("base64url")}`;
};

function editStore(fn) {
  const data = JSON.parse(readFileSync(FILE, "utf8"));
  data.collections.users ??= {};
  fn(data.collections.users);
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/** "ok", "denied", "login" or "missing" */
async function visit(path, cookie) {
  const res = await fetch(base + path, { headers: cookie ? { cookie } : {}, redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const body = res.status === 200 ? await res.text() : "";
  const target = location || body.match(/__next-page-redirect[^>]*url=([^"]+)/)?.[1] || "";
  if (target.includes("/admin/login")) return "login";
  if (target.includes("denied=")) return "denied";
  // Pages with a loading screen stream a 200 first, so notFound() shows up in the body instead of the status.
  if (res.status === 404 || body.includes("NEXT_HTTP_ERROR_FALLBACK;404")) return "missing";
  if (res.status === 200 && !target) return "ok";
  return `status ${res.status} ${target}`;
}

const failures = [];
const check = (label, got, want) => {
  const pass = got === want;
  if (!pass) failures.push(`${label}: expected ${want}, got ${got}`);
  return pass;
};

editStore((users) => {
  for (const u of testUsers) {
    users[u.id] = { id: u.id, email: `${u.id}@maputo2026.local`, name: `Test ${u.role}`, role: u.role, sportIds: u.sportIds, active: true, passwordHash: hash(PASSWORD) };
  }
});

try {
  const actors = [{ role: "super", email: "admin@maputo2026.local", sportIds: [] }, ...testUsers.map((u) => ({ ...u, email: `${u.id}@maputo2026.local` }))];

  check("signed out /admin", await visit("/admin"), "login");

  for (const actor of actors) {
    const cookie = cookieFor(actor.email, actor.role, actor.sportIds);
    const row = [];
    for (const [path, area] of pages) {
      const want = access[area].includes(actor.role) ? "ok" : "denied";
      row.push(check(`${actor.role} ${path}`, await visit(path, cookie), want) ? "." : "x");
    }
    const exportRes = await fetch(`${base}/api/admin/export`, { headers: { cookie } });
    row.push(check(`${actor.role} backup download`, exportRes.status, actor.role === "super" ? 200 : 403) ? "." : "x");
    console.log(`${actor.role.padEnd(8)} ${row.join("")}`);
  }

  const scorer = cookieFor("test-scorer@maputo2026.local", "scorer", ["basketball"]);
  const { matches = [] } = await (await fetch(`${base}/api/live`)).json();
  const own = matches.find((m) => m.sportId === "basketball");
  const other = matches.find((m) => m.sportId !== "basketball");
  if (own) check("scorer opens own-sport match", await visit(`/admin/scores/${own.id}`, scorer), "ok");
  if (other) check("scorer opens other-sport match", await visit(`/admin/scores/${other.id}`, scorer), "missing");

  editStore((users) => (users["test-editor"].active = false));
  check("deactivated editor", await visit("/admin", cookieFor("test-editor@maputo2026.local", "editor", [])), "login");
  editStore((users) => (users["test-editor"].role = "media", users["test-editor"].active = true));
  check("editor demoted to media opens announcements", await visit("/admin/c/announcements", cookieFor("test-editor@maputo2026.local", "editor", [])), "denied");
} finally {
  if (keep) {
    editStore((users) => (users["test-editor"] = { ...users["test-editor"], role: "editor", active: true }));
    console.log(`\nTest users kept. Log in as test-<role>@maputo2026.local / ${PASSWORD}`);
  } else {
    editStore((users) => testUsers.forEach((u) => delete users[u.id]));
  }
}

console.log(failures.length ? `\nFAIL\n- ${failures.join("\n- ")}` : `\nPASS: every role sees exactly the pages it should.`);
process.exit(failures.length ? 1 : 0);
