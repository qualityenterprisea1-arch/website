-- Outbound prospects gain the columns the lead pipeline actually produces.
--
-- The first version stored everything interesting inside three jsonb blobs, so
-- the dashboard could not sort by score, filter by proximity, or answer "which
-- prospects have a phone number" without pulling every row into the client.
-- Scalars the dashboard sorts and filters on are promoted to columns; the jsonb
-- keeps the full evidence.
--
-- Provenance is not optional. Every contact detail must name the page it was
-- read from, so a claim can always be checked against its source.

alter table public.outbound_prospects
  add column if not exists contact_name text check (contact_name is null or char_length(contact_name) <= 120),
  add column if not exists contact_title text check (contact_title is null or char_length(contact_title) <= 120),
  add column if not exists phones jsonb not null default '[]'::jsonb,
  add column if not exists emails jsonb not null default '[]'::jsonb,
  add column if not exists address text check (address is null or char_length(address) <= 500),
  add column if not exists district text check (district is null or char_length(district) <= 120),
  add column if not exists proximity_band text check (proximity_band is null or proximity_band in
    ('same-corridor', 'same-district', 'hyderabad', 'telangana-industrial', 'telangana', 'outside')),
  add column if not exists employment integer check (employment is null or employment between 0 and 1000000),
  add column if not exists investment_cr numeric check (investment_cr is null or investment_cr >= 0),
  add column if not exists score_total integer not null default 0 check (score_total between 0 and 100),
  add column if not exists grade text not null default 'D' check (grade in ('A', 'B', 'C', 'D', 'X')),
  add column if not exists recommended_action text check (recommended_action is null or char_length(recommended_action) <= 500),
  add column if not exists disqualified_reason text check (disqualified_reason is null or char_length(disqualified_reason) <= 300),
  add column if not exists source text check (source is null or char_length(source) <= 80),
  add column if not exists source_url text check (source_url is null or char_length(source_url) <= 500),
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists last_enriched_at timestamptz,
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists contacted_at timestamptz;

-- 'disqualified' records a prospect the scorer ruled out (competitor, no
-- location, out of area). Keeping the row prevents re-harvesting it every run.
alter table public.outbound_prospects drop constraint if exists outbound_prospects_status_check;
alter table public.outbound_prospects add constraint outbound_prospects_status_check
  check (status in ('new', 'researched', 'drafted', 'approved', 'contacted', 'won', 'lost', 'disqualified'));

create index if not exists outbound_prospects_score_idx on public.outbound_prospects (score_total desc);
create index if not exists outbound_prospects_grade_idx on public.outbound_prospects (grade);
create index if not exists outbound_prospects_proximity_idx on public.outbound_prospects (proximity_band);

comment on column public.outbound_prospects.phones is
  'Normalised +91 numbers, each with the source_url it was read from. Never generated.';
comment on column public.outbound_prospects.evidence is
  'Raw extraction record: pages crawled, people found, why each score was given.';
comment on column public.outbound_prospects.is_verified is
  'A human has confirmed the contact details against the source. Outreach requires this.';
comment on column public.outbound_prospects.do_not_contact is
  'Suppression flag. Honour it before any outreach, regardless of status or score.';

-- Still no anon or authenticated access. Service role only, as before.
revoke all on public.outbound_prospects from anon;
revoke all on public.outbound_prospects from authenticated;
