# Lead pipeline

Finds Hyderabad manufacturers who buy corrugated packaging, works out how
reachable and how close they are, and files them for a human to call.

**It never contacts a prospect.** No email, no message, no form fill, ever.
Outreach stays a human decision, because a bad send from
`send.quality-enterprises.co.in` costs the sending reputation that every real
quote notification depends on.

The one thing it does send is the weekly digest, and that goes to Quality
Enterprises itself — a call sheet to the factory, never a message to a lead.

```
discover ──► enrich ──► buyers ──► score ──► store ──► digest
   │           │          │          │         │          │
   │           │          │          │         │          └─ weekly email to the factory
   │           │          │          │         └─ Supabase (service role only)
   │           │          │          └─ corrugated-buyer model, not SaaS BANT
   │           │          └─ named purchase managers, current roles only
   │           └─ the company's own site: address, phones, emails
   ├─ factoriesindia.net — the licensed factory register, by industry × district
   └─ Exa company search — segment × area, unbounded
```

Two discovery sources on purpose. The register is authoritative but finite —
about thirty Telangana companies, and no amount of paging finds a thirty-first.
Exa is unbounded: it asks for the kind of business that buys cartons, in the
areas worth delivering to, and returns whoever is on the open web. Exa rows
arrive with a company and a website but no address, so the site crawl supplies
one; a prospect whose address cannot be found is disqualified rather than
guessed at, because proximity is 30 of the 100 points.

## Run it

Secrets live in `C:\qe-leads-dashboard\.env` — one file, outside git, already
holding the Supabase service key. `--env-file` loads it, so nothing has to be
exported into a shell:

```bash
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and EXA_API_KEY for named contacts
node --env-file=C:/qe-leads-dashboard/.env scripts/leads/run.mjs   # full sweep
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
| `--no-exa` | Directory only — skip Exa discovery |
| `--exa-results N` | Results per Exa query (default 10) |

Or press **Find new leads** in the dashboard, which runs the same command and
streams the log into the page.

## Autonomy

```powershell
powershell -ExecutionPolicy Bypass -File scripts\leads\install-schedule.ps1
```

Registers two weekly tasks, deliberately separate so a slow sweep never delays
the digest and a failed digest never looks like a failed sweep:

| Task | When | Does |
|---|---|---|
| `QE lead sweep` | Mon 07:00 | discover, enrich, find buyers, score, store |
| `QE lead digest` | Mon 09:00 | email the week's grade A and B to the factory |

The digest is the only email this system sends and it goes to Quality
Enterprises, never to a prospect. It exists so nobody has to remember to open
the dashboard. Preview it without sending:

```bash
node --env-file=C:/qe-leads-dashboard/.env scripts/leads/digest.mjs --days 7 --dry
```

The sweep is idempotent — it upserts on `website_url` and never touches a
human's `status`, `notes`, `is_verified` or `do_not_contact`. So it is safe to
run on a timer. Once a week is the right cadence: the source is a register of
licensed factories, and registers do not change daily.

```powershell
# Every Monday 07:00. Run once from an elevated PowerShell.
schtasks /create /tn "QE lead pipeline" /sc weekly /d MON /st 07:00 /f `
  /tr "cmd /c cd /d C:\qualityenterprises && node scripts\leads\run.mjs --quiet >> %TEMP%\qe-leads.log 2>&1"
```

A scheduled task inherits no shell session, so keep `--env-file` in the command
rather than relying on exported variables. The dashboard's **Find new leads**
button already passes its own environment to the pipeline, so a key added to
that `.env` reaches every path without further wiring.

`EXA_API_KEY` is optional. Without it the sweep still runs and still finds
phones, emails and addresses; it just skips the named-buyer lookup.

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

## Named purchasing contacts

A company website publishes its board, not its purchase manager. The person who
signs a packaging PO is found through their own public professional profile, so
`people.mjs` searches for one buying role per company and keeps it only if:

- the role is **current** — a finished role is never offered as a contact; and
- the company name matches **exactly**. `SMS Lifesciences` is a different
  business from `SMS Pharmaceuticals`, and a name filed against the wrong one is
  worse than no name, because somebody will actually ring it. A partial match is
  stored but flagged `near` in the dashboard as a prompt to check.

Procurement titles outrank the board: `Head of Procurement` (98) > `Purchase
Manager` (95) > `Managing Director` (75). A named buyer is most of the
reachability term, so finding one moves the grade.

**It never guesses an email from a name.** `firstname@company.com` is the
standard lead-generation trick and it is fabrication — the address is invented,
not observed. A name with no published address stays a name plus a switchboard
number to call through.

Add `EXA_API_KEY=...` to `C:\qe-leads-dashboard\.env` and it runs inside the
normal sweep with no extra step.

```bash
node --env-file=C:/qe-leads-dashboard/.env scripts/leads/people.mjs --limit 25

# Without a key: emit the searches, have an agent run them, feed results back.
node scripts/leads/people.mjs --queries --limit 15 > queries.json
node scripts/leads/people.mjs --ingest buyers.json
```

`--ingest` re-scores each row it touches, so a new contact updates the grade.

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
| `people.mjs` | Named buying contacts from public professional profiles |
| `score.mjs` | The corrugated-buyer model, and why each term is weighted as it is |
| `sources/exa.mjs` | Discovery: company search by segment × area |
| `digest.mjs` | Weekly email of new A/B leads, to the factory only |
| `install-schedule.ps1` | Registers the two weekly Windows tasks |
| `test.mjs` | `node scripts/leads/test.mjs` — asserts the extractors on fixed input |

## Adding a source

A source module exports `harvest(opts)` returning rows shaped like:

```js
{ company_name, city, address, district, raw_phones: [], email, website_url, source, source_url }
```

`run.mjs` handles dedupe, enrichment, scoring and storage from there. Keep
`source_url` truthful — it is what makes a claim checkable.
