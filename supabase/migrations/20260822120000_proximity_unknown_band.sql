-- A company found without an address is not "in Hyderabad" - it is unlocated.
-- The pipeline used to default city to 'Hyderabad', which handed 18 of 30
-- proximity points to every row whose location nobody had established, and also
-- stopped the "no location on record" disqualifier from ever firing.
alter table public.outbound_prospects drop constraint if exists outbound_prospects_proximity_band_check;
alter table public.outbound_prospects add constraint outbound_prospects_proximity_band_check
  check (proximity_band is null or proximity_band in
    ('same-corridor', 'same-district', 'hyderabad', 'telangana-industrial', 'telangana', 'outside', 'unknown'));

update public.outbound_prospects
set city = null
where address is null and district is null and city = 'Hyderabad' and source = 'exa';
