-- Private store for delegation passport scans and photographs.
-- The service role uploads and reads these from the server. No public policy.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'registration-files',
  'registration-files',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
