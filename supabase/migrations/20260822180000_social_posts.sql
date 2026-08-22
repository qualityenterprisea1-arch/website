-- The content queue.
--
-- Two posts and two videos a week, planned ahead, reviewed by a human, and
-- published by a human. Nothing here posts itself, for the same reason the lead
-- pipeline never contacts a prospect: an automated send that goes wrong costs
-- more than the automation saves.
--
-- The column that earns this table its place is `slug`. It is stamped into every
-- link as utm_content, so a quote request that arrives three weeks later can be
-- traced back to the exact piece that caused it — which is the only way to know
-- what to make more of.

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),

  -- Stable identifier from the subject bank. Travels into the link as
  -- utm_content and is what joins a quote back to the post that earned it.
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),

  week_of date not null,
  slot smallint not null check (slot between 1 and 4),

  pillar text not null check (char_length(pillar) <= 40),
  kind text not null check (kind in ('video', 'post')),
  format text not null check (format in ('reel', 'short', 'carousel', 'still')),

  title text not null check (char_length(title) <= 160),
  hook text not null check (char_length(hook) <= 200),
  caption text not null check (char_length(caption) <= 2200),
  cta text check (cta is null or char_length(cta) <= 300),
  hashtags text[] not null default '{}',

  -- Which shots from the one-visit shoot this needs, by their number in
  -- social/SHOOT.md. A piece whose shots are missing cannot be marked ready.
  shots smallint[] not null default '{}',
  source text not null default 'footage' check (source in ('footage', 'generated', 'mixed')),

  -- Higgsfield/Seedance prompt and job record for anything not filmed.
  generation jsonb not null default '{}'::jsonb,

  channels text[] not null default '{instagram,facebook,linkedin,whatsapp,youtube}',
  link text check (link is null or char_length(link) <= 400),

  status text not null default 'queued'
    check (status in ('queued', 'ready', 'approved', 'posted', 'skipped')),
  posted_at timestamptz,
  posted_urls jsonb not null default '{}'::jsonb,
  notes text check (notes is null or char_length(notes) <= 2000),

  created_at timestamptz not null default now()
);

comment on table public.social_posts is
  'Planned content, one row per piece. Human-published: nothing in this table posts itself.';
comment on column public.social_posts.slug is
  'Stamped into every link as utm_content. Joins quote_requests.utm back to the piece that earned the enquiry.';
comment on column public.social_posts.shots is
  'Shot numbers from social/SHOOT.md that this piece needs. Empty means it needs no footage.';

create index if not exists social_posts_week_idx on public.social_posts (week_of desc, slot);
create index if not exists social_posts_status_idx on public.social_posts (status);

alter table public.social_posts enable row level security;

drop policy if exists staff_select_social on public.social_posts;
create policy staff_select_social on public.social_posts
  for select to authenticated using (public.is_staff());

-- Staff are the authors here, so unlike outbound_prospects there is no column
-- guard: editing the caption before posting is the entire point of the review.
drop policy if exists staff_update_social on public.social_posts;
create policy staff_update_social on public.social_posts
  for update to authenticated using (public.staff_can_edit()) with check (public.staff_can_edit());

grant select, update on public.social_posts to authenticated;
revoke all on public.social_posts from anon;

-- Which pieces actually produced enquiries.
--
-- utm_content carries the slug, so this is a plain join rather than a guess. A
-- piece with views and no row here is a piece that entertained people who were
-- never going to buy, and that is worth knowing early.
create or replace view public.social_performance as
  select p.slug, p.week_of, p.pillar, p.kind, p.format, p.title, p.status, p.posted_at,
         count(q.id) as quotes,
         count(q.id) filter (where q.status = 'won') as won,
         max(q.created_at) as last_quote_at
    from public.social_posts p
    left join public.quote_requests q
      on q.utm ->> 'utm_content' = p.slug
   group by p.slug, p.week_of, p.pillar, p.kind, p.format, p.title, p.status, p.posted_at;

-- The view runs as its caller, so quote_requests' own RLS still applies and this
-- exposes nothing that /leads does not already show.
alter view public.social_performance set (security_invoker = on);
grant select on public.social_performance to authenticated;
