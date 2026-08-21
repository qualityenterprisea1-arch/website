-- Team access to the leads desk.
--
-- Until now every read of outbound_prospects went through the service role key,
-- which bypasses RLS entirely and therefore could never be handed to a browser.
-- That is why the dashboard had to stay on 127.0.0.1.
--
-- This grants signed-in staff direct, row-level-secured access, so the hosted
-- app needs no service key at all. The database decides who sees what; a leaked
-- anon key is worthless without a session belonging to an allowlisted address.

create table if not exists public.staff_allowlist (
  email text primary key check (position('@' in email) > 1 and char_length(email) <= 254),
  name text check (name is null or char_length(name) <= 120),
  can_edit boolean not null default true,
  active boolean not null default true,
  added_at timestamptz not null default now()
);

comment on table public.staff_allowlist is
  'Who may sign in to /leads. Membership is by email address, checked against the JWT on every query.';
comment on column public.staff_allowlist.can_edit is
  'False gives read-only access: the person can work the list but not change status or notes.';

alter table public.staff_allowlist enable row level security;

-- Staff may see who else is on the team; nobody may edit the list from the app.
-- Adding or removing a person is a deliberate act done with the service role.
drop policy if exists staff_read_allowlist on public.staff_allowlist;
create policy staff_read_allowlist on public.staff_allowlist
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- One predicate, used by every policy below.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_allowlist
    where active and lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

create or replace function public.staff_can_edit()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_allowlist
    where active and can_edit and lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_staff() from public, anon;
revoke all on function public.staff_can_edit() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.staff_can_edit() to authenticated;

-- ---------------------------------------------------------------- prospects

drop policy if exists staff_select_prospects on public.outbound_prospects;
create policy staff_select_prospects on public.outbound_prospects
  for select to authenticated using (public.is_staff());

-- Staff work the pipeline. They do not rewrite the harvested evidence, so the
-- update is column-limited by a trigger below rather than by the policy, which
-- cannot express "these columns only".
drop policy if exists staff_update_prospects on public.outbound_prospects;
create policy staff_update_prospects on public.outbound_prospects
  for update to authenticated using (public.staff_can_edit()) with check (public.staff_can_edit());

create or replace function public.guard_prospect_columns()
returns trigger
language plpgsql
as $$
begin
  -- Everything a human is allowed to change is listed here. Anything else is
  -- pipeline output and is restored to its previous value, so a compromised
  -- session cannot quietly rewrite a phone number or a source URL.
  new.company_name        := old.company_name;
  new.website_url         := old.website_url;
  new.address             := old.address;
  new.district            := old.district;
  new.city                := old.city;
  new.industry            := old.industry;
  new.phones              := old.phones;
  new.emails              := old.emails;
  new.contacts            := old.contacts;
  new.contact_name        := old.contact_name;
  new.contact_title       := old.contact_title;
  new.contact_phone       := old.contact_phone;
  new.contact_email       := old.contact_email;
  new.score               := old.score;
  new.score_total         := old.score_total;
  new.grade               := old.grade;
  new.proximity_band      := old.proximity_band;
  new.evidence            := old.evidence;
  new.analysis            := old.analysis;
  new.source              := old.source;
  new.source_url          := old.source_url;
  new.last_enriched_at    := old.last_enriched_at;
  new.created_at          := old.created_at;
  return new;
end;
$$;

drop trigger if exists guard_prospect_columns on public.outbound_prospects;
create trigger guard_prospect_columns
  before update on public.outbound_prospects
  for each row
  when (current_setting('role', true) is distinct from 'service_role')
  execute function public.guard_prospect_columns();

grant select, update on public.outbound_prospects to authenticated;

-- ------------------------------------------------------------- quote requests

drop policy if exists staff_select_quotes on public.quote_requests;
create policy staff_select_quotes on public.quote_requests
  for select to authenticated using (public.is_staff());

drop policy if exists staff_update_quotes on public.quote_requests;
create policy staff_update_quotes on public.quote_requests
  for update to authenticated using (public.staff_can_edit()) with check (public.staff_can_edit());

grant select, update on public.quote_requests to authenticated;

-- anon keeps exactly what it had: INSERT on quote_requests from the public form,
-- and nothing at all on outbound_prospects.
revoke all on public.outbound_prospects from anon;
revoke all on public.staff_allowlist from anon;
