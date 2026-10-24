-- Games Control Room schema (Maputo 2026).
-- Content is stored as one JSON document per item so the admin can manage every
-- collection (announcements, documents, media, matches, results ...) with one table.
-- All reads and writes go through the Next.js server with the service-role key;
-- RLS is enabled with no public policies so the anon key cannot read or write.

create table if not exists public.content_items (
  collection  text        not null,
  id          text        not null,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  primary key (collection, id)
);

create index if not exists content_items_collection_idx on public.content_items (collection, updated_at desc);

-- A collection appears here once it has been seeded or edited; until then the
-- public site keeps using the built-in content from src/data.
create table if not exists public.content_collections (
  collection   text primary key,
  initialised_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  actor       text        not null,
  role        text        not null,
  action      text        not null,
  collection  text,
  item_id     text,
  summary     text
);

create index if not exists audit_log_at_idx on public.audit_log (at desc);

alter table public.content_items      enable row level security;
alter table public.content_collections enable row level security;
alter table public.audit_log          enable row level security;

-- Public bucket for photos, logos and PDFs. Uploads use signed upload URLs
-- created on the server, so no insert policy is needed for anon users.
insert into storage.buckets (id, name, public)
values ('games-media', 'games-media', true)
on conflict (id) do nothing;
