-- The per-platform payload.
--
-- One piece goes to five places that truncate at different lengths, index
-- different fields, and make the link clickable or not. Storing the five
-- renderings rather than composing them in the browser keeps a single source of
-- truth in scripts/social/platforms.mjs — the alternative was the same rules
-- written twice, in JavaScript and TypeScript, drifting apart by the third edit.
--
-- Shape, per platform key:
--   text          the caption or description, ready to paste
--   tags          hashtags chosen for that platform and pillar
--   alt           what is on screen, for screen readers and for indexing
--   query         the question this piece answers, in a buyer's words
--   answer        that question answered outright, for AI overviews
--   warnings      anything over a fold or a limit, checked at plan time
--   title         YouTube only — the query as a search title
--   keywords      YouTube only — the tags field on the upload form
--   firstComment  LinkedIn only — the link, kept out of the post body
alter table public.social_posts
  add column if not exists platforms jsonb not null default '{}'::jsonb;

comment on column public.social_posts.platforms is
  'Per-platform rendering of this piece: caption, hashtags, alt text, and the YouTube/LinkedIn extras. Written by scripts/social/plan.mjs.';
