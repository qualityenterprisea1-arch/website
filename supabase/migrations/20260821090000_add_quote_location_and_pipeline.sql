-- Location is captured by the public quote form. Status and notes are written
-- only by the local dashboard through the service role.
alter table public.quote_requests
  add column city text check (city is null or char_length(city) between 1 and 80),
  add column area text check (area is null or char_length(area) between 1 and 120),
  add column status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  add column notes text check (notes is null or char_length(notes) <= 5000),
  add column last_contacted_at timestamptz;

create index quote_requests_status_idx on public.quote_requests (status);
create index quote_requests_area_idx on public.quote_requests (area);

comment on column public.quote_requests.city is
  'Delivery city derived server-side from content/deliveryAreas.json.';
comment on column public.quote_requests.area is
  'Delivery area, including free text for requests outside Hyderabad.';
comment on column public.quote_requests.status is
  'Internal sales pipeline state. Never accepted from the public quote form.';
