-- Where a quote request came from.
--
-- Without this an enquiry from Instagram and one from a Google search are
-- indistinguishable, so there is no way to tell whether a content plan or an ad
-- budget is doing anything. Added before the social plan starts rather than
-- after, so the first month is measurable.
alter table public.quote_requests
  add column if not exists channel text check (channel is null or char_length(channel) <= 60),
  add column if not exists utm jsonb not null default '{}'::jsonb,
  add column if not exists referrer text check (referrer is null or char_length(referrer) <= 300),
  add column if not exists landing_page text check (landing_page is null or char_length(landing_page) <= 300);

create index if not exists quote_requests_channel_idx on public.quote_requests (channel);

comment on column public.quote_requests.channel is
  'Human-readable first-touch source: Instagram, Google, Direct, a bare host. Derived in the browser, never trusted for anything but reporting.';
comment on column public.quote_requests.utm is
  'Raw utm_*, gclid and fbclid captured on the landing page of the session.';
