-- Lead capture for the /quote wizard. This table is written by unauthenticated
-- visitors, so every constraint here is a trust boundary, not a formality.
create table public.quote_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  box_type    text    not null check (char_length(box_type) between 1 and 120),
  length      text    check (char_length(length) <= 20),
  width       text    check (char_length(width)  <= 20),
  height      text    check (char_length(height) <= 20),
  unit        text    not null default 'mm' check (unit in ('mm', 'in')),
  ply         text    check (char_length(ply) <= 40),
  quantity    integer not null check (quantity >= 500 and quantity <= 10000000),
  printing    text    check (char_length(printing) <= 40),

  name        text    not null check (char_length(name)  between 1 and 120),
  phone       text    not null check (char_length(phone) between 4 and 40),
  company     text    check (char_length(company) <= 160),
  email       text    check (email is null or email = '' or (char_length(email) <= 254 and position('@' in email) > 1))
);

comment on table public.quote_requests is
  'Quote wizard submissions. Anonymous INSERT only; reads require the service role.';

create index quote_requests_created_at_idx on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

-- Anonymous visitors may add a request and nothing else. There is deliberately
-- no SELECT/UPDATE/DELETE policy, so the anon key cannot read back other
-- people's contact details even though it ships in the browser bundle.
create policy "anon can submit a quote request"
  on public.quote_requests
  for insert
  to anon
  with check (true);

revoke all on public.quote_requests from anon;
grant insert on public.quote_requests to anon;
