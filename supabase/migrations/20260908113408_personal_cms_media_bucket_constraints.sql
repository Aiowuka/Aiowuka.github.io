update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array[
      'image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif',
      'audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/flac'
    ]::text[]
where id = 'site-media';
