-- Scraped prospects are deliberately separate from inbound quote requests.
create table public.outbound_prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null check (char_length(company_name) between 1 and 200),
  website_url text not null check (char_length(website_url) between 8 and 500),
  city text check (city is null or char_length(city) <= 80),
  industry text check (industry is null or char_length(industry) <= 120),
  description text check (description is null or char_length(description) <= 2000),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 80),
  contacts jsonb not null default '[]'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'researched', 'drafted', 'approved', 'contacted', 'won', 'lost')),
  notes text check (notes is null or char_length(notes) <= 5000),
  outreach_draft text check (outreach_draft is null or char_length(outreach_draft) <= 10000),
  is_verified boolean not null default false
);

create unique index outbound_prospects_website_url_idx on public.outbound_prospects (website_url);
create index outbound_prospects_status_idx on public.outbound_prospects (status);
create index outbound_prospects_city_idx on public.outbound_prospects (city);

alter table public.outbound_prospects enable row level security;
revoke all on public.outbound_prospects from anon;
revoke all on public.outbound_prospects from authenticated;
