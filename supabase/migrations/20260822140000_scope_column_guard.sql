-- The column guard was written as "everything except service_role", which also
-- caught the postgres role behind the SQL console and any DBA session. The
-- failure mode was invisible and expensive: an admin UPDATE reported success,
-- RETURNING showed the OLD values because the trigger had already restored
-- them, and the change silently never happened. Two separate data fixes were
-- reported as applied when nothing had changed.
--
-- The guard exists to stop a staff BROWSER session rewriting harvested
-- evidence. That role is 'authenticated'. Name it, rather than excluding one
-- role and catching every other caller by accident.
drop trigger if exists guard_prospect_columns on public.outbound_prospects;
create trigger guard_prospect_columns
  before update on public.outbound_prospects
  for each row
  when (current_setting('role', true) = 'authenticated')
  execute function public.guard_prospect_columns();

-- Verified with a simulated staff session (role authenticated plus
-- request.jwt.claims): contact_phone and score_total are held at their old
-- values while status and notes update normally.
