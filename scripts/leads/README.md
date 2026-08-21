# Lead pipeline

Finds Hyderabad manufacturers who buy corrugated packaging, works out how
reachable and how close they are, and files them for a human to call.

**It never sends anything.** No email, no message, no form fill. Outreach stays
behind a person, because a bad send from `send.quality-enterprises.co.in` costs
the sending reputation that every real quote notification depends on.

```
discover ──► enrich ──► score ──► store
   │           │          │         │
   │           │          │         └─ Supabase outbound_prospects (service role only)
   │           │          └─ corrugated-buyer model, not SaaS BANT
   │           └─ the company's own site: phones, emails, named people
   └─ factoriesindia.net, by industry × district
```

## Run it

```bash
# needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
node scripts/leads/run.mjs                                  # full sweep
node scripts/leads/run.mjs --industries pharma,food         # narrow it
node scripts/leads/run.mjs --districts hyderabad --dry      # look, do not write
node scripts/leads/run.mjs --rescore                        # re-score existing rows
```

| Flag | Meaning |
|---|---|
| `--industries a,b` | Default: every industry whose output ships in cartons |
| `--districts a,b` | Default: Telangana districts within a sane lorry run |
| `--pages N` | Directory pages per index (default 6) |
| `--concurrency N` | Sites crawled at once (default 4) |
| `--limit N` | Stop after N companies — useful when testing |
| `--dry` | Harvest and score, print, write nothing |
| `--rescore` | Re-enrich and re-score rows already in the table |

Or press **Find new leads** in the dashboard, which runs the same command and
streams the log into the page.

## Autonomy

The sweep is idempotent — it upserts on `website_url` and never touches a
human's `status`, `notes`, `is_verified` or `do_not_contact`. So it is safe to
run on a timer. Once a week is the right cadence: the source is a register of
licensed factories, and registers do not change daily.

```powershell
# Every Monday 07:00. Run once from an elevated PowerShell.
schtasks /create /tn "QE lead pipeline" /sc weekly /d MON /st 07:00 /f `
  /tr "cmd /c cd /d C:\qualityenterprises && node scripts\leads\run.mjs --quiet >> %TEMP%\qe-leads.log 2>&1"
```

The task needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as **user**
environment variables (`setx`), because a scheduled task does not inherit a
shell's session variables.

## What the score means

100 points, and distance is the heaviest term on purpose. Corrugated board is
bulky and cheap per kilo, so freight is a large slice of delivered cost — a
plant on the next road is a structurally better prospect than a bigger one
across the state.

| Term | Max | What it reads |
|---|---|---|
| Proximity | 30 | Same corridor → same district → Hyderabad → wider Telangana |
| Packaging fit | 25 | How much board the sector's output consumes per dispatch |
| Reachability | 25 | A named buying-title contact, a phone, a real email |
| Scale | 20 | Plant count, entity type, and official employment/investment where published |

Grades: **A** ≥ 78, **B** ≥ 62, **C** ≥ 45, **D** below. **X** is disqualified —
a packaging company (competitor), no location on record, or outside the delivery
area. Disqualified rows are kept so the next run does not re-harvest them.

## The rules this pipeline is built on

1. **Nothing is invented.** Every phone number, email and name is extracted from
   a page the company published, and each one is stored with the `source_url` it
   came from. A field with no source stays null. A wrong phone number is worse
   than a missing one.
2. **`is_verified` and `do_not_contact` are human-only.** The pipeline never
   writes them. A scraped contact cannot mark itself safe to email.
3. **Outbound stays separate from inbound.** `outbound_prospects` is a different
   table from `quote_requests`, service-role only, with anon and authenticated
   revoked. A person who asked for a quote is not a scraped prospect and the two
   must never be mixed.
4. **Re-runs never overwrite human work.** The upsert payload simply omits
   `status`, `notes`, `is_verified`, `do_not_contact` and `outreach_draft`.

## Files

| File | Does |
|---|---|
| `run.mjs` | Orchestration and CLI |
| `sources/factoriesindia.mjs` | Discovery: the factory register, by industry and district |
| `enrich.mjs` | Phone/email/person extraction from a company's own site |
| `score.mjs` | The corrugated-buyer model, and why each term is weighted as it is |
| `test.mjs` | `node scripts/leads/test.mjs` — asserts the extractors on fixed input |

## Adding a source

A source module exports `harvest(opts)` returning rows shaped like:

```js
{ company_name, city, address, district, raw_phones: [], email, website_url, source, source_url }
```

`run.mjs` handles dedupe, enrichment, scoring and storage from there. Keep
`source_url` truthful — it is what makes a claim checkable.
