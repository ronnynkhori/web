-- Uploads go straight from the browser to Storage with signed URLs, so the
-- bucket itself must enforce size and type. Keep in step with prepareUpload()
-- in src/app/admin/actions/content.ts (25 MB; JPG, PNG, WebP, SVG, PDF).
update storage.buckets
set file_size_limit    = 26214400,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
where id = 'games-media';
