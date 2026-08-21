# Handoff prompt — paste this whole file to the next agent

You are continuing work on **Quality Enterprises**, a live corrugated packaging
manufacturer site. Read `HANDOFF.md` in the repo root **first** — it has the full
session history, the live infrastructure IDs, and a "RULES LEARNED THE HARD WAY"
block. Do not skip it.

---

## WHERE THINGS ARE

| Thing | Where |
|---|---|
| Website repo | `C:\qualityenterprises` — Next.js 15, App Router, Tailwind v4 |
| Live site | https://www.quality-enterprises.co.in (www primary, apex 308s to it) |
| GitHub | `github.com/qualityenterprisea1-arch/website`, branch `main`, public |
| Supabase | project ref `mkvrspngtomsngtwtrek`, ap-south-1, table `public.quote_requests` |
| Resend | verified sending domain `send.quality-enterprises.co.in` |
| Leads dashboard | `C:\qe-leads-dashboard` — **separate local app**, Node, no deps, binds 127.0.0.1 |
| Sales plugin | installed as `ai-sales-team` — 14 skills (`/sales-*`), 5 agents, deps installed |
| Secrets | `.env.local` files, gitignored. Never commit or echo them. |

---

## HARD RULES — violating these breaks things that already work

1. **Tailwind v4: every custom class MUST be inside `@layer components`** (base styles
   in `@layer base`). Unlayered CSS beats ALL Tailwind utilities regardless of
   specificity — this already caused an invisible-UI bug where `bg-ultra` silently lost
   to `.card` and produced white-on-white. There is **no `tailwind.config.ts`**;
   `@theme` in `app/globals.css` is the single source of colour and type scale.
2. **Design register = the board diagram's spec sheet.** Hairline borders, small radii,
   mono spec labels, instrument readouts, real numbers. `.spec-panel` is the pattern.
   The user rejected BOTH a poster/brutalist look AND a flat generic SaaS look. Never
   reintroduce: Anton font, hard offset shadows, graph-paper backgrounds, competitor
   comparison tables. Character lives in composition, not ornament.
3. **No invented data. Ever.** No fake company age, headcount, tonnage, certifications,
   client names, or sample leads presented as real. If a value is not verified, omit it
   or label it. Never say the business is "new" or "starting fresh".
4. **Never put `SUPABASE_SERVICE_ROLE_KEY` in the website, in Vercel, or behind any
   `NEXT_PUBLIC_` prefix.** RLS on `quote_requests` grants anon `INSERT` only — that is
   deliberate and must stay. Reading leads requires the service key, which is why the
   dashboard is local-only.
5. **Kill node and delete `.next` before rebuilding.** Running `npm run build` while a
   dev/prod server is serving corrupts `.next` and every route 500s.
6. **Verify, do not assume.** Every claim of "it works" must come from a command you
   ran and read: `npm run build`, a real browser check, an actual DB query. Delete any
   test rows you create.

---

## TASK 1 — Add city / delivery area (they serve Hyderabad only, today)

The quote form currently captures: box_type, length, width, height, unit, ply,
quantity, printing, name, phone, company, email. **There is no location field**, so
"leads from Hyderabad" is an assumption, not data. Make it real.

- Add a step (or a field on the existing details step) for **City / delivery area**.
- Since they serve **Hyderabad only right now**, make it a select of Hyderabad areas
  (Narsingi, Gachibowli, Madhapur, Kukatpally, Secunderabad, Jeedimetla, Balanagar,
  Uppal, Shamshabad, Medchal, Patancheru, …) **plus an "Outside Hyderabad" option**
  that captures free text. Do not silently reject non-Hyderabad leads — capture them
  and flag them, because that is market intelligence.
- **Everything must be dynamic**: the area list lives in `content/` and is imported by
  the form, the API route and the dashboard. Adding a city later must be a one-line
  content edit, not a code change in three places.
- Migration: add `city text` and `area text` (or one column plus a flag) to
  `public.quote_requests`, with a length CHECK like the other columns — this is an
  unauthenticated write path. Commit the SQL to `supabase/migrations/`.
- Update `app/api/quote/route.ts` validation and the Resend notification email.
- Update the dashboard table + add a "by area" breakdown.

---

## TASK 2 — Make the dashboard genuinely interactive

`C:\qe-leads-dashboard` currently: stats row, searchable table, CSV export,
auto-refresh, click-to-call. It is plain HTML/CSS/JS with a tiny Node server.
Keep it **local-only and dependency-light**, but make it a real working tool:

- **Lead status pipeline** — New → Contacted → Quoted → Won / Lost. Needs a `status`
  column and an update path. The dashboard server (which holds the service key) does
  the write; the browser never touches Supabase directly.
- **Notes per lead** + last-contacted timestamp.
- **Charts** — leads over time, by format, by ply, by area, quantity distribution.
  **Load the `dataviz` skill BEFORE writing any chart code.** No CDN scripts (the page
  must work offline); inline everything.
- **Filters** — date range, status, area, format, quantity band. Combined with search.
- **Detail drawer** on row click with the full spec and a "copy quote summary" button.
- **Keyboard + a11y**: focus states, Esc to close, arrow-key row nav, real labels.
- Sort by any column. Persist filter state in the URL so views are shareable.

**UI skills to use — load them before writing code, not after:**
- `dataviz` — mandatory before any chart, graph or stat tile.
- `design-taste-frontend` — the anti-slop default for building the interface.
- `ui-ux-pro-max` — concrete palettes, spacing, dashboard layout patterns.
- `web-design-guidelines` — run as a review pass before you call it done.
- `animate` (decision) then `animejs` (API) if you add motion. anime.js v4 is already
  a dependency of the website; the dashboard has none, so keep motion CSS-only there
  unless you have a reason. **Honor `prefers-reduced-motion`.**

Match the site's existing tokens (`--paper --bone --ink --ink-soft --line --ultra
--signal --kraft`) so the dashboard and the website read as one system.

---

## TASK 3 — Outbound: use the sales plugin to find real prospects

**Be precise about what this can and cannot do.** The `ai-sales-team` plugin is a set
of Claude Code skills and Python scripts. It does **not** autonomously generate leads
on a schedule. What it genuinely does:

- `scripts/analyze_prospect.py --url <url>` — fetches and analyses a company site
- `scripts/contact_finder.py` — extracts contact details from a site
- `scripts/lead_scorer.py` — scores a prospect
- skills: `/sales-icp`, `/sales-prospect`, `/sales-qualify`, `/sales-outreach`,
  `/sales-competitors`, `/sales-proposal`, `/sales-report`
- scripts live at `${CLAUDE_PLUGIN_ROOT}/scripts/` (already rewritten from relative paths)

**Build a real pipeline around that:**

1. Use `/sales-icp` to define the ICP from what the site already sells — Hyderabad
   businesses that ship physical goods: food processing, pharma, e-commerce
   fulfilment, electronics, textiles, logistics, agri-produce.
2. **Discovery needs a real source.** Use the `exa` or `firecrawl` MCP (both installed)
   to find actual Hyderabad companies matching the ICP. Do not invent company names.
3. Run each discovered URL through `analyze_prospect.py` + `contact_finder.py` +
   `lead_scorer.py`.
4. Store results in a **new** Supabase table `outbound_prospects` — keep it separate
   from `quote_requests`, which is inbound and must stay clean. Same RLS discipline:
   no anon read.
5. Surface both in the dashboard behind tabs: **Inbound** (quote_requests) and
   **Outbound** (outbound_prospects), with a combined pipeline view.
6. Draft outreach with `/sales-outreach`, but **do not send anything automatically.**
   Queue drafts for human approval. Sending cold email from the verified Resend domain
   without review risks the domain's reputation, which currently carries the lead
   notifications the business depends on.

**Data honesty:** anything scraped is unverified. Mark it as such in the UI. Never mix
scraped prospects into the inbound leads count.

---

## VERIFY BEFORE YOU CLAIM DONE

- `npx tsc --noEmit` clean, `npm run build` passes all routes.
- Drive the real quote form in a browser end to end; confirm the row lands in Supabase
  with the new city/area, and the Resend email includes it. **Delete the test row.**
- Dashboard: load it, exercise filters/charts/status updates, screenshot and look at it.
- Run axe-core (wcag2a + wcag2aa) on the site and the dashboard — the site is currently
  at **0 violations across 8 routes with exactly one h1 each**. Do not regress that.
- Commit in focused commits with real messages. Push to `main`.
- Update `HANDOFF.md` `CURRENT STATE` + append a SESSION LOG entry before you stop.

## STILL OUTSTANDING (not your task unless asked)

- Three Vercel env vars may still be unset: `NEXT_PUBLIC_SITE_URL`,
  `QUOTE_NOTIFY_FROM`, `QUOTE_NOTIFY_TO`. Check `robots.txt` on the live site — if it
  says `website-sandy-ten-39`, they were never set.
- Strix pentest not yet run (Docker + image ready; needs the user's `STRIX_LLM` and
  `LLM_API_KEY`). Run it against the live URL, not a local directory.
- PHONE / WHATSAPP / EMAIL / GSTIN still unsupplied by the client. Contact rows are
  omitted rather than shown as "pending" — keep it that way until real values arrive.
