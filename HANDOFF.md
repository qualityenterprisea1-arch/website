# HANDOFF — read this before touching anything

Two agents work this repo: **Claude** and **GPT-5.6**. Only one at a time. This file is
the baton. `SPEC.md` is *what to build* and never records progress; this file is
*what happened* and never records decisions. Keep that split or both files rot.

**The one rule:** before you stop — because you finished, ran out of budget, or got
stuck — overwrite `CURRENT STATE` and append a `SESSION LOG` entry. An un-updated
baton means the next agent redoes your work.

---

## CURRENT STATE  ← overwrite this whole block every session

```
LAST AGENT     : Claude (Opus 5)
DATE           : 2026-08-21
LAST COMMIT    : da5858c
BUILD PHASE    : LIVE. https://www.quality-enterprises.co.in
                 Site, Supabase, Resend, local dashboard and lead pipeline all up.
WORKING        : Public site carries the real IDA Mallapur address, phone and
                 emails, a Google Maps embed, one-page quoting on /contact#quote,
                 and "Products" in the nav. The outbound lead pipeline
                 (scripts/leads/) harvests, enriches, scores and stores real
                 prospects with phone numbers. The dashboard reads and works them.
BROKEN         : QUOTE_NOTIFY_TO in VERCEL is still the old address - the local
                 .env.local was changed but a Vercel env var can only be set by
                 the account that owns the project, and the Vercel CLI on this
                 machine is logged into `samad001z` / samad001zs-projects, which
                 does NOT contain this project. The USER must set it.
NEXT ACTION    : 1. In the Vercel dashboard for this project, set
                      QUOTE_NOTIFY_TO = qualityenterprisesa1@gmail.com
                    then redeploy. Until then live quote notifications go to
                    001saadurrahman@gmail.com. (NEXT_PUBLIC_SITE_URL is already
                    correct - verified via /robots.txt on the live site.)
                 2. Schedule the lead sweep. Command is in scripts/leads/README.md.
                 3. GSTIN still unsupplied; that row stays omitted.
                 4. Strix pentest still not run.
```

---

## PROTOCOL

1. **Read `SPEC.md` first, this file second.** SPEC wins on any conflict about *what*
   to build. This file wins on *what state the code is in*.
2. **Never delete another agent's log entry.** Append only. Correct a wrong entry by
   adding a new one that says so.
3. **Commit before you stop.** Small commits, real messages. The other agent diffs
   against your commit to see what moved.
4. **Claim before you start** — add a SESSION LOG entry with status `IN PROGRESS` at the
   top of your session, close it out at the end. If you find an open `IN PROGRESS` entry
   from the other agent, assume those files are mid-edit and read them before writing.
5. **Mark every claim as verified or assumed.** "Verified" means you ran something and
   read the output. If you did not run it, write `ASSUMED`. This matters more than
   anything else in this file — most cross-agent rework comes from trusting an
   unverified claim.
6. **Log dead ends.** What you tried that did not work is worth as much as what did.
7. **Placeholder discipline** (from SPEC §0): any invented value ships wrapped in
   `<!-- UNVERIFIED -->`. Do not quietly promote a placeholder to fact.

---

## VERIFIED FACTS — append only, each with how it was proven

Environment, checked 2026-08-20 by Claude via shell:
- `node 24.11.1`, `npm 11.11.1`, `git 2.52.0`.
- **Vercel CLI IS installed** (`~/AppData/Roaming/npm/vercel`) — a session startup hook
  claims it is not. The hook is wrong.
- Supabase CLI is **not** installed. Use the Supabase MCP, or `npx supabase`.
- Supabase MCP is authed — 4 existing projects, none for this build. `ap-south-1`
  (Mumbai) is available and is the right region for a Hyderabad audience.
- No project deps installed; `package.json` does not exist yet.
- ⚠ Home dir `C:\Users\001sa` has a stray `package.json`. Never install from there.

anime.js v4, proven in-browser via Playwright 2026-08-20 by Claude:
- `onScroll({container: window})` **throws** — anime.js calls `getComputedStyle()` on it
  and `window` is not an Element. Omit `container`; the default is correct.
- Both `createTimeline({autoplay: onScroll(...)})` and
  `onScroll(...).link(tl)` drive a timeline correctly once `container` is gone.
  Confirmed by watching `tl.progress` move.
- `.set()` inside a scrubbed timeline reverts correctly on reverse scroll.
  `.call()` does **not** — see DEAD ENDS #2.
- All 5 beats of the board sequence are reachable in order (40-sample scroll sweep);
  the flute highlight fires within beat 3.

Not yet verified by anyone — do not claim these work:
- The board section at 375px, and its `prefers-reduced-motion` path. Both are new code
  written 2026-08-20 and **never once executed**.
- Any Lighthouse number in SPEC §9.

---

## DEAD ENDS — do not retry these

1. **`container: window` in `onScroll()`** — throws. It was the original bug, and the
   script's own trailing `.catch()` swallowed it and silently rendered the static
   fallback, so it looked like a scroll-tuning problem for a long time. If the board
   ever "just shows the static diagram", suspect a swallowed throw first and check the
   console — the `.catch()` now logs instead of failing silently.
2. **Driving beat state with `.call()` in a scroll-scrubbed timeline** — callbacks do not
   revert when scrubbing backwards, so ply/copy/panel got stuck on scroll-up. Beats are
   now `.set()` on a numeric `st.beat`, and `render()` is a pure function of progress.
   Keep it that way: any new state must be derived, never a side effect.
3. **Two writers on one property** — `hi()` and `leaders()` both set callout opacity, and
   the per-frame one won, so the highlight never held. One writer per property.
4. **OPEN, not solved:** after the timeline completes, the observer stops driving it —
   frozen on the last beat even back at `scrollY 0`. Verified: ruler tick stuck at 18
   across a full sweep. Prime suspect is that `onScroll({...}).link(tl)` discards the
   returned observer, leaving it collectable. **Try retaining it in a variable first.**
5. **`sync: .13` overshoots on large scroll jumps** (scrollbar drag, End key) — lands
   several beats ahead and does not settle back. Continuous wheel scrolling tracks fine.
   Re-tune only after #4 is fixed; they may be the same bug.
6. **Writing large HTML via a bash heredoc fails** on this Windows/Git-Bash setup —
   quoting breaks. Use the file-write tool.

---

## HOW TO TEST THE BOARD SECTION

```bash
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let x=q.url==='/'?'/board-wireframe-sequence.html':q.url;try{r.writeHead(200,{'Content-Type':'text/html'});r.end(f.readFileSync(p.join('C:/qualityenterprises',x)))}catch(e){r.writeHead(404);r.end()}}).listen(4321)"
```
Then drive `http://localhost:4321/` in a real browser. **Scroll continuously in small
increments** — jumping straight to a scroll offset gives misleading results because of
the `sync` lerp (DEAD ENDS #5). Read progress off the ruler tick index and the `01/05`
step label; both are live.

---

## SESSION LOG — append only, newest at the bottom

### 2026-08-20 · Claude (Opus 5) · DONE
**Did:** Changed MOQ 450 → 500 across SPEC (8 places; `5,000` competitor figure and the
`500089` postcode deliberately untouched). Surveyed available skills/MCPs against the
build and wrote it up as SPEC §11, including which skills to *refuse* and why. Debugged
the board prototype end to end with Playwright and rewrote its drive layer; geometry
functions ported verbatim and unchanged. Initialised git, committed baseline.

**Files:** `SPEC.md` (+§11, §12, MOQ), `board-wireframe-sequence.html` (rewritten drive
layer), `board-wireframe-sequence.broken.bak` (original, keep for reference),
`.gitignore`, `HANDOFF.md`.

**Left broken:** DEAD ENDS #4 and #5. Mobile + reduced-motion paths written but never run.

**For the next agent:** Phase 1 does not depend on any of that — §6 is Phase 3. Highest
value now is scaffolding Next.js 15 + Tailwind with the SPEC §3 tokens and getting the
`/quote` wizard writing to Supabase. Four blockers need the client, not an agent:
`PHONE`, `WHATSAPP`, `EMAIL`, `GSTIN` are still `TODO` in SPEC §0, and the whole
BOARD SPECS block is invented — build behind `<!-- UNVERIFIED -->` until they land.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Scaffolded Next.js 15 App Router with Tailwind v4, next/font typography, typed content, responsive header/footer, mobile sticky call/quote bar, homepage, quote wizard, contact page, box hub/detail routes, about, process, works, LocalBusiness JSON-LD, Product JSON-LD, sitemap and robots.
**Files:** package.json, package-lock.json, next.config.ts, tsconfig.json, postcss.config.mjs, tailwind.config.ts, app/, components/, content/, .env.example.
**Verified how:** `npm install` completed. `npm run build` completed successfully with 20 static routes. `Invoke-WebRequest` returned HTTP 200 for `/` and `/quote`. The dev server is running at `http://localhost:3000`.
**Left broken:** Supabase project/table and env vars are not provisioned. PHONE, WHATSAPP, EMAIL and GSTIN remain visibly marked unverified. Board wireframe Phase 3 remains deferred. Browser screenshot/a11y audit was not completed because the in-app browser connector was not available in the exposed tool set.
**For the next agent:** Provision Supabase `quote_requests` with anon INSERT-only RLS, then run the Playwright acceptance checks at 375px and desktop. Keep the placeholder contact/spec values until verified.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Repositioned the site for B2B packaging buyers, changed the navigation logo to “Quality Enterprises”, removed the 500-box hero punchline, replaced consumer language, and expanded the product catalogue from 8 generic entries to 20 supplied product families. Excluded colour shipping boxes as requested. Added extracted product reference images under `public/products/` and wired them through the homepage, catalogue and detail routes.
**Files:** `app/page.tsx`, `app/layout.tsx`, `app/about/page.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/HeroBoxes.tsx`, `app/boxes/page.tsx`, `app/boxes/[slug]/page.tsx`, `content/boxTypes.ts`, `public/products/*`.
**Verified how:** `npm run build` completed successfully with 32 static routes. `rg` confirmed the old D2C, cloud-kitchen and 500-unit hero positioning was removed; remaining `500` references are limited to the explicit MOQ/FAQ flow in the build spec.
**Left broken:** Supabase provisioning and verified contact details remain outstanding. Product crops are derived from the supplied reference boards and should be replaced by individual approved product photos when available.
**For the next agent:** Continue with Supabase/RLS and browser acceptance checks. Preserve the B2B language and the 20-item product taxonomy.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Added a mobile-only product marquee moving left to right, with a static horizontal-scroll fallback for reduced-motion users. Reworked the product rail from circular playful art into rectangular catalogue tiles. Completed the Phase 2 content pass by expanding all nine process stages, replacing generic Works placeholders with a real capability gallery, and aligning the quote wizard with B2B packaging terminology.
**Files:** `components/HeroBoxes.tsx`, `app/globals.css`, `app/process/page.tsx`, `app/works/page.tsx`, `app/quote/page.tsx`.
**Verified how:** `npm run build` generated all 32 routes successfully. After restarting the stale dev server, `/`, `/boxes`, `/works`, `/process` and `/quote` each returned HTTP 200.
**Left broken:** Supabase/RLS, verified contact facts and the Phase 3 board animation are still outstanding. Product photographs remain reference-board crops until approved individual assets are supplied.
**For the next agent:** Phase 2 is complete. Continue with Phase 3 board construction or provision Supabase first. Preserve the single mobile marquee and reduced-motion fallback.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Removed the “B2B corrugated packaging from Narsingi” hero eyebrow and completed Phase 3. Ported the existing board wireframe geometry into a lazy client component, integrated it as the second homepage section, retained the anime.js scroll observer to avoid the known completion freeze, and added static mobile and reduced-motion layouts that do not initialise anime.js.
**Files:** `app/page.tsx`, `app/globals.css`, `components/BoardConstruction.tsx`, `components/BoardConstructionLoader.tsx`.
**Verified how:** `npm run build` generated all 32 routes. The homepage first-load JS remained 113 kB while anime.js and the board implementation were emitted as separate chunks. Fresh dev-server checks returned HTTP 200 for `/`, `/boxes`, `/works`, `/process` and `/quote`; the removed hero line was absent from the rendered homepage HTML.
**Left broken:** In-app Browser was unavailable in this session, so the integrated scroll scrub, 375px layout and reduced-motion rendering were not visually driven after the port. The source and build paths are implemented, but a browser visual audit remains required. Supabase/RLS and verified contact details also remain outstanding.
**For the next agent:** Phase 3 code is complete. Run the browser acceptance sweep when the in-app browser is available, then provision Supabase. Do not reintroduce the removed hero eyebrow.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Corrected the Phase 3 timing mismatch from the supplied screenshot. Replaced the independent beat side effects with one pure scroll-progress state machine so ply visibility, layer separation, callout opacity, flute highlight, copy, instrument values and ruler all derive from the same progress value. Removed the extra bottom scroll cue and kept the technical styling restrained for a corrugated manufacturing site.
**Files:** `components/BoardConstruction.tsx`, `HANDOFF.md`.
**Verified how:** `npm run build` passes with all 32 routes. Fresh dev server on port 3001 returned HTTP 200 for `/`, `/boxes` and `/quote`; the removed hero eyebrow is absent. Source audit confirms there is no `state.beat` side-effect model, and the timeline now animates a single `driver.progress` value.
**Left broken:** In-app Browser was unavailable, so this pass could not be visually scrubbed at desktop or 375px. The static and reduced-motion branches remain implemented but still require browser-driven verification. Supabase/RLS and verified contact details remain outstanding.
**For the next agent:** Run the browser scroll sweep when available. If the visual audit passes, Phase 3 is complete and the next work is Supabase/RLS or Phase 4 asset replacement.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Fixed the deeper SVG alignment issue exposed by the follow-up screenshots. The rendered layers are now tagged and sorted by their actual layer index before animation, and their movement uses explicit SVG `transform` attributes in the same coordinate system as the leader-line math. Removed rotation and scale motion that made the technical diagram feel decorative. Added a B2B credibility section for delivery planning, custom solutions and a complete production line, based on the supplied industry reference without copying unsupported claims.
**Files:** `components/BoardConstruction.tsx`, `app/globals.css`, `app/page.tsx`.
**Verified how:** `npm run build` passes with all 32 routes. Source audit confirms the layer index sort, SVG transform attributes and absence of the old scroll cue. The B2B proof section is present in the homepage source and avoids guaranteed delivery/revenue claims.
**Left broken:** In-app Browser was unavailable, so the corrected 3-ply, 5-ply and 7-ply alignment still needs a visual desktop and 375px scrub audit. Supabase/RLS and verified contact details remain outstanding.
**For the next agent:** Start with a browser visual check of the board states before making further animation changes. The technical section should stay restrained and functional.

<!-- template for the next entry:

### YYYY-MM-DD · <agent> · IN PROGRESS | DONE | BLOCKED
**Did:**
**Files:**
**Verified how:**
**Left broken:**
**For the next agent:**

-->

### 2026-08-21 · GPT-5.6 · DONE
**Did:** Completed all three tasks in `NEXT-TASK-PROMPT.md`. Added dynamic delivery
area capture and server-derived city/area validation to the public quote flow and
Resend notification. Applied and committed migrations for location/pipeline fields and
a separate RLS-protected `outbound_prospects` table. Rebuilt the local dashboard with
inbound/outbound/combined tabs, editable pipeline status and notes, last-contacted
tracking, inline SVG charts, combined filters, URL persistence, sortable tables, CSV,
an accessible detail drawer, copy summary and keyboard navigation. Defined the local
packaging ICP and added a reviewed-URL discovery runner around all three installed
ai-sales-team scripts. Public-web discovery produced three real Hyderabad prospects:
Kreata Foods, Sri Krishna Pharma and Lee Pharma. Each official URL was analyzed,
normalized after review, stored separately as `is_verified=false`, and given a draft
for human approval. No cold email was sent. Deleted all six E2E quote rows and temp
test/build artifacts.
**Files:** `app/quote/{page,layout}.tsx`, `app/api/quote/route.ts`, `app/globals.css`,
`content/{deliveryAreas.json,salesIcp.ts}`, `scripts/discover-prospects.mjs`,
`supabase/migrations/20260821080235_create_quote_requests.sql`,
`supabase/migrations/20260821090000_add_quote_location_and_pipeline.sql`,
`supabase/migrations/20260821091000_create_outbound_prospects.sql`, `HANDOFF.md`;
plus local-only `C:\qe-leads-dashboard\{index.html,server.js,README.md,.env.example}`.
**Verified how:** `npx tsc --noEmit` clean and clean `npm run build` generated 34
routes. Real quote submission reached live Supabase with Hyderabad/Narsingi. Resend API
lookups for notification IDs `2e0f24a5-dbd8-4ca6-a420-409c157d1c48` and
`142c31b4-d862-40f2-be48-e35f9f0329d6` both contain `Delivery` in HTML and text.
Dashboard API returned three drafted/unverified outbound rows; Playwright against local
Chrome exercised Outbound, Combined URL persistence and the outbound drawer, visually
inspected the screenshot, and found zero axe wcag2a/wcag2aa violations. Final database
query found zero E2E rows. `node --check` passed for dashboard server and discovery
script; `git diff --check` passed.
**Left broken:** In-app Browser was unavailable; standalone Playwright was used. The
third-party contact finder timed out on Lee Pharma and extracted false positives on
other sites, so reviewed top-level contact fields were normalized and remain explicitly
unverified. The live deployment will not include this commit until GitHub/Vercel finishes
after push.
**For the next agent:** Keep outbound data separate and unverified until a human confirms
it. Never send the queued drafts automatically. The local dashboard remains outside git
and bound to `127.0.0.1`.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Installed the reviewed third-party `seo` skill from `affaan-m/ECC` into `C:\Users\001sa\.codex\skills\seo`; the source contains only `SKILL.md` and no companion files. Added mobile-safe footer spacing and removed dead pending-contact action links. Replaced the mobile board fallback with three deterministic horizontal scroll-snap panels for 3 ply, 5 ply and 7 ply while preserving the desktop anime.js scrub. Added reusable canonical/OG/Twitter metadata, unique metadata for public routes, FAQPage and BreadcrumbList schema, product schema without fabricated offers, and a truthful Organization/LocalBusiness schema without pending phone/email/GSTIN values. Updated robots and sitemap priorities.
**Files:** `components/Footer.tsx`, `components/MobileBar.tsx`, `components/BoardConstruction.tsx`, `app/globals.css`, `content/seo.ts`, `content/faq.ts`, route metadata/schema files, `app/robots.ts`, `app/sitemap.ts`.
**Verified how:** `npm run build` passes and prerenders all 32 routes. Static audit confirms the old 500-unit title and removed hero eyebrow are absent; pending contact values are not emitted in JSON-LD. The in-app browser connector was unavailable, so a live 375px screenshot/sweep could not be completed.
**Left broken:** Browser-driven visual verification remains outstanding. Phone, WhatsApp, email and GSTIN remain intentionally unverified. About Us content was not changed.

### 2026-08-20 · GPT-5.6 · DONE
**Did:** Audited all visual assets and created a complete generation brief in `images/README.md`, including prompts for all 20 product formats and an inventory of missing/blank crops. Archived the supplied PNG references under `images/source/`, generated AVIF/WebP derivatives under `public/images/products/` and `public/images/catalog/`, and switched the product catalogue to the AVIF paths. No artificial upscaling was applied to the original ~172px crops; fresh high-resolution generation remains the correct next step for visibly sharper product pages.
**Verified how:** `npm run build` passes for all 32 routes. FFmpeg AVIF/WebP conversion completed; all product references now resolve under `/images/products/`.
**Left broken:** The built-in image-generation tool was not exposed in this session, so fresh AI product masters could not be generated here. Three original shipping source crops are near-blank and are explicitly flagged in `images/INVENTORY.md` for replacement.

### 2026-08-20 · USER PAUSED FOR NEW SESSION
**Resume objective:** Generate fresh, consistent, high-resolution product images for all 20 catalogue products, review them, convert final selections to AVIF/WebP, and wire them into every catalogue and product-detail route.
**Required setup:** This Codex installation currently uses the custom `AgentRouter` provider and did not expose the native `image_gen` tool. The user plans to configure `OPENAI_API_KEY` and restart Codex. Never ask the user to paste the key into chat. Confirm only that the environment variable is set, then use the installed `imagegen` skill's CLI fallback with its bundled `scripts/image_gen.py` and `gpt-image-2` unless the restarted session exposes native `image_gen`.
**Exact user continuation prompt:** `OPENAI_API_KEY is configured. Use the imagegen CLI fallback to generate all 20 product images, optimize them, and wire them into the website.`
**Prepared inputs:** Full shared art direction and 20 product-specific prompts are in `images/README.md`. Existing source references are in `images/source/`; quality issues are documented in `images/INVENTORY.md`.
**Target paths:** Preserve generated lossless/high-quality masters under `images/generated-masters/`. Put production AVIF and WebP assets under `public/images/products/`. Update `content/boxTypes.ts` only after each final asset exists. Do not include colour shipping boxes.
**Quality rules:** Professional B2B corrugated packaging photography; consistent warm-white studio background; accurate folds, board thickness and construction; no logos, fake labels, people, watermarks, glossy plastic or toy-like renders. Generate separate images per product, inspect each one, and regenerate inaccurate outputs. Do not upscale the old 171–172px crops.
**Verification:** Run `npm run build`, verify all 32 routes, and visually inspect the catalogue, homepage product rail and representative detail pages at mobile and desktop widths. Preserve About Us and unverified contact facts.
**Current commits:** `1cd1859` mobile board/footer and SEO; `1bb34b6` optimized image pipeline and prompt pack.

### 2026-08-21 · Claude (Opus 5) · DONE
**Did:** User feedback was that the build read "too funky" and needed a professional
register. Two kinds of work: real bugs, then a design pass.

*Bugs found and fixed:*
1. **Tailwind v4 was never wired to the theme.** `tailwind.config.ts` is not read by
   Tailwind v4 without `@config`, and there was no `@theme` block, so EVERY brand colour
   utility (`bg-ink`, `text-paper`, `bg-ultra`, `bg-kraft`, `text-ink-soft`) silently
   resolved to nothing. Dark sections rendered light and blue CTAs rendered invisible.
   Added `@theme` to `globals.css`; deleted the dead `tailwind.config.ts`.
2. **`<!-- UNVERIFIED -->` rendered as literal on-page text** in the board-specs cards.
   In JSX that string is content, not an HTML comment. Removed; the placeholder discipline
   now lives in a source comment, and the section says the exact board is confirmed on the
   written quote.
3. **Internal build notes were customer-facing copy** — "working placeholders until the
   machine sheet is confirmed", "photo slots stay honest until we have the right factory
   images", "map will be embedded once the verified GBP pin is supplied", nine "Factory
   photo slot / Real machine photograph to be added" boxes on /process. All removed.
4. **/quote reported success on a failed write.** `try { fetch } finally { setSent(true) }`
   meant a dropped request still told the buyer we had their enquiry. Now has explicit
   sending/sent/failed states; a failure tells them it did not send and offers /contact.
5. **Board callouts collided with the instrument panel** at 7 ply (BASE LINER was clipped).
   Moved the panel to bottom-left, away from the right-hand callout column.
6. **Board heading was clipped under the sticky header** — top offset raised.
7. Missing favicon (404) — added `app/icon.svg`.
8. Five routes had no `h1` (SectionIntro always emitted `h2`). Added an `as` prop.

*Design pass — the "funky" was concentrated in four decisions:*
- Anton condensed poster caps at up to 128px. Dropped Anton entirely; headings are now
  Instrument Sans, sentence case, and the Tailwind display scale (`--text-3xl`..`8xl`)
  was retuned downward in `@theme` so every existing size utility shrank in one place
  rather than editing 20 files.
- Neo-brutalist cards: 2px ink borders + `6px 6px 0` hard kraft shadows + 18px radius.
  Now 1px hairline, 10px radius, no shadow.
- Graph-paper background texture sitewide. Removed.
- Strawman comparison table ("Typical Hyderabad plant" ✕ vs us ✓). This also carried the
  unverified "competitors start at 5,000" claim SPEC §11 flagged. Replaced with a
  commitments list stating only what we actually promise.
- Also: circular product image on box detail → rectangular frame; kraft header band →
  paper with a hairline rule; electric `#1D3FBF` → `#14407A`; zigzag translate on /process
  → a clean numbered list.

*Image quality:* product masters are 172x170 crops. They were being upscaled ~3x into
large panels, which showed a baked-in artifact line. Detail-page panel capped at 280px so
they render near native. Fresh generation is still the real fix.

**Files:** `app/globals.css`, `app/layout.tsx`, `app/icon.svg` (new), `app/page.tsx`,
`app/quote/page.tsx`, `app/contact/page.tsx`, `app/process/page.tsx`, `app/works/page.tsx`,
`app/about/page.tsx`, `app/boxes/page.tsx`, `app/boxes/[slug]/page.tsx`,
`components/{Header,Footer,Faq,MobileBar,SectionIntro,HeroBoxes}.tsx`.
Deleted: `tailwind.config.ts` (dead under Tailwind v4).

**Verified how:** `npx tsc --noEmit` clean. `npm run build` passes, 33 routes prerendered.
Playwright at 1440x900 and 375x812 across /, /boxes, /quote, /contact, /process, /works,
/about, /boxes/kraft-shipping-boxes — screenshots read and reviewed, including a five-point
scroll sweep of the board section. axe-core wcag2a+wcag2aa: **0 violations on all 8 routes**;
h1 count is exactly 1 on each; zero console errors. `getComputedStyle` on `.bg-ink`
confirmed the colour bug before the fix and the fix after.

**Left broken:** Supabase still unprovisioned — /quote deliberately fails loudly now.
PHONE/WHATSAPP/EMAIL/GSTIN still pending; contact rows for them are omitted rather than
shown as "pending". Product images still 172px crops. Board section not driven at 375px
by a real touch scroll (the mobile path is the static scroll-snap panels, screenshotted only).

**For the next agent:** Do not reintroduce Anton, hard offset shadows, the graph-paper
background, or the competitor-comparison table — those were the specific things the user
called funky. Keep `@theme` as the single source of colour and display scale; there is no
`tailwind.config.ts` any more. Keep the /quote failure state until Supabase is live.

### 2026-08-21 - Claude (Opus 5) - DONE
**Did:** Follow-up to the same day's re-skin. The user's read was that the first pass had
gone too far the other way - correct. That pass fixed the funk by *removing* character,
which left a generic SaaS-template look.

The insight that fixed it: **the board diagram was already the right register for this
business** - hairline linework, mono spec labels, an instrument readout, real numbers -
and every other section had been flattened into something generic instead of matching it.
So the correction was not "more decoration", it was "more technical".

- Palette now shares the board section's ground. `--color-bone` is set to exactly the
  same value as `--board-bone` (#D7D4CB) so the diagram and the page are one surface.
  Added `--color-signal` for technical accents.
- Added `.spec-panel` - a site-wide version of the board's instrument readout. It now
  carries the hero capability block, the three board constructions, the box-detail
  specification and the contact factory block. One tabular pattern across the site.
- Cards regained material weight: 4px radius, warmer hairline, a very soft shadow.
- Hero gained an anchor (capability panel) instead of an empty right half.
- Section rhythm alternates paper / bone / ink / kraft.

**Files:** `app/globals.css`, `app/page.tsx`, `app/contact/page.tsx`,
`app/boxes/[slug]/page.tsx`. Commit `0ff4828`.

**Verified how:** `npx tsc --noEmit` clean. Production build, 33 routes. Then verified
**against `next start`, not the dev server** - axe-core wcag2a+wcag2aa reports 0
violations across 8 routes, h1 count exactly 1 on each, zero failed network requests,
zero console errors. Screenshots at 1440x900 and 375x812 read and reviewed.

**Dead end worth recording:** a `/_next/static/chunks/app/boxes/[slug]/page.js` 404 shows
up in the **dev** server after editing that route and persists until `.next` is cleared.
It does not exist in a production build. Do not chase it. Related: running `npm run build`
while `next dev` is live corrupts the dev server's `.next` and every route 500s - kill
node and delete `.next` before restarting.

**Left broken / decisions needed:**
- Supabase still unprovisioned; /quote fails loudly by design.
- `images/corrugated_catalog_masters/` (commit `ae8baae`) holds 23 real 1402px product
  masters generated by **another session, not this one**. They are committed but **not
  wired in** - `content/boxTypes.ts` still points at the old 172px crops. Two blockers:
  23 assets for 20 formats with prompt-derived filenames, so the asset-to-slug mapping
  needs a human; and asset-010 has a fabricated **INDESTRUCTO (with a trademark symbol)
  / ENGINEERED TO PROTECT** brand mark printed on the box, which should not ship on this
  manufacturer's own catalogue. Other printed text ("CHIPBOARD BOX", "SBS CARDBOARD BOX",
  die-cut panel labels) is generic or genuinely useful and is probably fine.

**For the next agent:** Do not reintroduce Anton, hard offset shadows, the graph-paper
background, or the competitor-comparison table. Equally, do not flatten the site back to
white cards and hairlines - the target is the board diagram's spec-sheet register, and
`.spec-panel` is how that is expressed. `@theme` in `globals.css` is the single source of
colour and display scale; there is no `tailwind.config.ts` any more.

### 2026-08-21 - Claude (Opus 5) - DONE
**Did:** Four things from user feedback. One was a real bug worth reading carefully.

**1. THE LAYER BUG (root cause, affected more than the reported symptom).**
Reported as "quote page goes white blank when I select an option". Cause: `.card` and
friends were declared as **unlayered** CSS, while Tailwind v4 emits its utilities inside
`@layer utilities`. **Unlayered CSS beats layered CSS regardless of specificity.** So on
the selected state, `bg-ultra` and `border-ultra` silently lost to `.card`'s own
`background`, while `text-paper` won (nothing else set `color`) - paper text on a paper
card. Proven in-browser before the fix: computed `bg` was `rgb(252,250,245)` with
`color: rgb(248,246,242)`.
Fix: base styles into `@layer base`, component styles into `@layer components`.
This also un-broke `spec-panel bg-paper` on the homepage board specs, which had been
ignored the same way and nobody had noticed.
**Lesson for this repo: any new component class MUST go inside `@layer components`,
or it will silently swallow Tailwind utilities applied alongside it.**

**2. Wired the real product images.** All 20 catalogue products now use the 1254-1402px
masters from `images/corrugated_catalog_masters/`; the old 172px crops are deleted. The
asset-to-slug mapping is recorded in the scratchpad script and mirrored in the commit.
**asset-010 is deliberately unused** - it carries a fabricated "INDESTRUCTO(R)" brand
mark, so `indestructo-mailers` uses asset-008 (unbranded) instead. asset-014 also spare.
Because the images are now high-res, the render caps added for the tiny crops are gone.

**3. /boxes and /works were duplicate content.** /works was literally
`boxTypes.slice(0, 12)` with the same images linking to the same detail pages - bad for
users and bad for indexing. /works is now capability content: flexo printing, die-cutting
and blanks, fold and lock constructions, multi-depth scoring - each illustrated with the
*blank or the score* rather than the finished product, so it cannot drift back into being
a second catalogue. Nav entry renamed "Our works" -> "Capabilities".

**4. Hero reworked.** Kraft ground behind the image half, a real product photograph, and
the capability spec panel offset to overlap the image corner. The overlap is the single
deliberate piece of asymmetry - the user asked for "a little funky", and this plus the
signal-red numerals on /works and the hover scale on product tiles is where that went.

**Files:** `app/globals.css` (layering), `app/page.tsx`, `app/works/page.tsx`,
`app/boxes/page.tsx`, `app/boxes/[slug]/page.tsx`, `components/Header.tsx`,
`components/HeroBoxes.tsx`, `content/boxTypes.ts`, `public/images/products/*`.
Commit `7a2760e`.

**Verified how:** `npx tsc --noEmit` clean. Production build, 33 routes. Against
`next start` (not dev): axe-core wcag2a+wcag2aa 0 violations across 8 routes, h1 count
exactly 1 each, zero failed network requests, zero console errors. The quote selection
was re-tested in a real browser after the fix - computed background `rgb(20,64,122)`.
Desktop 1440x900 and mobile 375x812 screenshots read and reviewed.

**Left broken:** Supabase provisioning is now the only blocker of substance. Contact
phone/email/GSTIN still pending; those rows are omitted rather than shown as "pending".

**For the next agent:**
- New component classes go in `@layer components`. Non-negotiable, see item 1.
- Do not turn /works back into a product grid. It exists to show process, not catalogue.
- Do not use `asset-010`; it has a fabricated trademark on the box.
- Design target remains the board diagram's spec-sheet register. Do not reintroduce
  Anton, hard offset shadows, the graph-paper background, or the competitor table.

### 2026-08-21 - Claude (Opus 5) - DONE  [LAUNCH SESSION]
**Did:** Took the build from local-only to live. Product images, factory photography,
hero rebuild, About rewrite, Supabase, Resend, GitHub, Vercel, custom domain.

**LIVE INFRASTRUCTURE (none of this is in the repo - .env.local is gitignored):**
- Site        : https://www.quality-enterprises.co.in  (www is PRIMARY, apex 308s to it)
- Vercel      : website-sandy-ten-39.vercel.app, deployed from GitHub main
                NOTE: the Vercel account holding this project is NOT the one the
                Vercel MCP is authed to (that one only shows a project "cracked").
- GitHub      : github.com/qualityenterprisea1-arch/website  (PUBLIC, default branch main)
                Local git was renamed master -> main to match.
- Supabase    : project ref `mkvrspngtomsngtwtrek`, region ap-south-1
                table public.quote_requests, migration committed in supabase/migrations/
- Resend      : sending domain send.quality-enterprises.co.in, VERIFIED
                domain id bacfe0ba-640a-4ebf-96b8-2cb19253d2a3, region ap-northeast-1
                Resend ACCOUNT email is qualityenterprisea1@gmail.com (no 's' before a1)
- DNS         : Spaceship, nameservers launch1/launch2.spaceship.net (their normal DNS)

**RULES LEARNED THE HARD WAY - do not relearn these:**

1. **Tailwind v4: every component class MUST live inside `@layer components`.**
   Unlayered CSS beats ALL Tailwind utilities regardless of specificity. An unlayered
   `.card { background }` silently swallowed `bg-ultra` on the quote wizard's selected
   state, leaving paper text on a paper card - the "white blank box" bug. Base styles
   go in `@layer base` for the same reason. There is NO tailwind.config.ts; `@theme`
   in globals.css is the single source of colour and display scale.

2. **Resend cannot send FROM a gmail.com address.** You can only send from a domain
   verified in Resend. And the onboarding@resend.dev fallback only delivers TO the
   Resend account owner. Both cost a round trip to discover.

3. **Never run `npm run build` while `next dev`/`next start` is serving.** It corrupts
   the running server's .next and every route 500s with MODULE_NOT_FOUND. Kill node,
   delete .next, rebuild, then start.

4. **A `/_next/static/chunks/app/.../page.js` 404 in DEV** after editing a route is a
   stale-chunk artifact, not a bug. It never appears in a production build.

5. **Windows `nslookup` prints TXT records as empty.** Use
   `curl "https://dns.google/resolve?name=<n>&type=TXT"` to actually read them.

6. **Bash heredocs with complex quoting break on this Git-Bash setup** (DEAD ENDS #6).
   Write a .py file to the scratchpad and run it instead.

**DESIGN DIRECTION - the user gave three rounds of feedback, landing here:**
- Round 1 "too funky": killed Anton poster caps, hard offset shadows, graph-paper
  background, and a strawman competitor table.
- Round 2 "too simple / too professional, a little funky is ok": that first pass had
  removed character rather than changing its kind. The fix was **not** decoration.
- **The target is the board diagram's spec-sheet register** - hairline linework, mono
  spec labels, instrument readouts, real numbers. `.spec-panel` is how that is
  expressed and it now carries the hero, board constructions, box detail, contact and
  capabilities. Do NOT flatten back to white cards, and do NOT reintroduce the poster
  look. Character lives in composition (the dark bleeding hero, offset overlaps,
  signal-red numerals), not ornament.
- Hero is DARK because the supplied hero photo is a low-key factory frame; on cream it
  read as a heavy rectangle pasted on a light page.
- Hero entrance is **CSS keyframes with `backwards` fill, never JS** - base state is
  visible, so a JS failure cannot hide the headline.

**CONTENT RULES the user set explicitly:**
- No fake content. No invented company age, headcount, tonnage, certifications or
  client names. Every claim on /about traces to something committed elsewhere.
- Do NOT say the business is new / starting fresh - the user's words: buyers "don't
  care about fresh starters". Volunteering it invites the reader to discount the page.
- `images/corrugated_catalog_masters/asset-010` is EXCLUDED from the site: it carries a
  fabricated "INDESTRUCTO(R)" trademark. Never wire it in.
- /process and /about carry a disclosure that the photography illustrates standard
  conversion stages rather than this unit. Keep it while the images are generated.
- /works must NOT become a second product grid. It was a duplicate of /boxes; it now
  shows process/capability. Nav label is "Capabilities".

**SECURITY POSTURE (audited this session, Strix still outstanding):**
- RLS on quote_requests: anon INSERT only. SELECT 42501, UPDATE/DELETE 401, MOQ
  constraint 400 - all verified against the live project, not assumed.
- /api/quote validates server-side, has a honeypot (`website` field), and inserts
  BEFORE emailing so a failed notification can never lose a lead.
- 6 security headers + poweredByHeader:false in next.config.ts.
- jsonLdScript escapes < > & (it feeds dangerouslySetInnerHTML).
- KNOWN, ACCEPTED: 3 high npm vulns via next@15.5.23 (postcss, sharp). Not reachable -
  postcss issues are build-time on authored CSS, sharp needs attacker-controlled
  images and next.config declares no remotePatterns. Fix is next@16, a major upgrade.
  **Re-check immediately if remote image domains are ever added.**

**For the next agent:** read the RULES block above before touching CSS or email. The
single highest-value remaining task is confirming the three Vercel env vars, because
until then the live site advertises the wrong canonical origin and lead notifications
land in the wrong inbox.

### 2026-08-21 - Claude (Opus 5) - DONE  [CONTACT FACTS, MAP, ONE-PAGE QUOTE]

**Did:** Four user-requested changes, plus an audit of GPT-5.6's outbound pipeline.

**1. The quote wizard is gone.** The user's words: "in get a quote its becoming
tooo long while selecting a option net entering dimensions and next too long and
some times frustrating". Six steps meant five Next clicks before the form would
accept anything. `app/quote/` is deleted; `components/QuoteForm.tsx` renders every
field on one screen and is embedded on `/contact` under `id="quote"`. Selects
replaced the card grids - twenty format cards became one `<select>`. `/quote` 308s
to `/contact#quote` via `next.config.ts` redirects, so indexed links survive.
`/boxes/<slug>` now links `/contact?box=<slug>#quote` and the form prefills the
format from that param in a mount effect (no Suspense boundary needed, page stays
static). The `/api/quote` payload shape is unchanged - the route was not touched.

**2. Real contact facts.** `content/site.ts` now carries:
  address  Road No. 13, Plot No. 75A, IDA Mallapur, Hyderabad, Telangana 500076
  phone    +91 94404 32434   (phoneHref: tel:+919440432434)
  email    qualityenterprisesa1@gmail.com
  emailAlt quality-enterprises@outlook.com
GSTIN is still the only `pending` value and its row is still omitted.
Narsingi/500089 is gone from every route, the footer, the hero eyebrow, the FAQ
and the LocalBusiness JSON-LD, which now also emits `telephone` and `email`.
Mallapur was added to `content/deliveryAreas.json`.
NOTE: the Resend ACCOUNT email is `qualityenterprisea1@gmail.com` (no 's'); the
business inbox the user supplied is `qualityenterprisesa1@gmail.com` (with 's').
Different addresses. Do not "correct" either one.

**3. Google Maps on /contact.** Keyless `?output=embed` iframe, no API key, no
client JS. The CSP here is `frame-ancestors 'none'`, which governs who may frame
us, not what we frame - the iframe is unaffected.
**Do not put the full address in the map query.** Google has no address-level
record for Plot 75A and silently pins a *neighbouring business* ("RSP AIR
PRODUCTS PVT LTD") when given the whole string. Verified by rendering three query
variants side by side. `Road No 13, IDA Mallapur, Hyderabad, Telangana 500076`
resolves exactly and pins the road; the plot number is carried by the caption
below the map. Nominatim has no record for the estate at all - it only returns the
Mallapur suburb centroid, which would pin the wrong place. Do not hardcode
coordinates unless the user supplies their own Maps pin.

**4. Nav "Boxes" -> "Products".** Label only. `/boxes` routes are unchanged.

**New CSS rule:** `.label-stack` in `@layer components`. `.eyebrow` is
`inline-flex; align-items: center`, so `<label className="eyebrow">Text <input/></label>`
parks the label *beside* its input and squeezes it to nothing. Caught in a
screenshot, not in the build. Any new form label needs `label-stack eyebrow`.

**Files:** `components/QuoteForm.tsx` (new), `app/contact/page.tsx`,
`app/quote/` (deleted), `content/site.ts`, `content/deliveryAreas.json`,
`content/faq.ts`, `next.config.ts`, `app/sitemap.ts`, `app/layout.tsx`,
`app/{about,page,process,works}`, `app/boxes/[slug]/page.tsx`,
`components/{Header,Footer,Hero,MobileBar}.tsx`, `app/globals.css`. Commit `9bb1bca`.

**Verified how:** `npx tsc --noEmit` clean. Production build, 33 routes. Against
`next start`: `/quote` returns 308 to `/contact#quote`; a real POST with the new
payload returned `{"ok":true}`, landed in live Supabase with area "Mallapur", and
Resend logged id `d5f4abb2-1cfc-4e2f-9eed-69204e4ad29f`; the test row was then
deleted and a follow-up count confirmed 0 remaining. axe-core wcag2a+wcag2aa: 0
violations and exactly 1 h1 on 7 routes. Desktop 1440x900 and mobile 375x812
screenshots read and reviewed - the map renders and pins Road No. 13 on both.

**Left broken:** Commit 9bb1bca is local only. Nothing else known.

---

### AUDIT: the outbound prospect pipeline does not work yet

The user asked whether the sales agents are producing real, accurate leads aimed
at purchasing managers. Checked against the live `outbound_prospects` table, not
against the previous handoff entry. Findings:

**The companies are real.** Kreata Foods, Sri Krishna Pharma and Lee Pharma all
exist, are in Hyderabad, and all ship physical product. No hallucinated rows.

**The leads are not usable.** `jsonb_array_length(contacts)` is **0 on all three
rows**. Not one named person, not one job title, not one purchasing manager. The
`contact_email` values are generic role inboxes scraped from page footers -
`sales@`, `skg@`, `purchase@`. `purchase@leepharma.com` happens to be the right
department, but that is the site publishing it, not the agent targeting it.
`contact_phone` is null on all three.

**The scorer agrees.** All three grade **D**. BANT totals are 24, 19 and 6 out of
100. Every row's own `recommended_action` reads "Low priority - add to long-term
nurture sequence. Revisit in 90 days." The pipeline's own verdict on its entire
output is: do not contact these people.

**The scoring model is measuring the wrong things.** `scripts/discover-prospects.mjs`
builds the scorer input from SaaS signals: budget from `pricing_tiers.length > 0`,
timeline and need from `has_job_postings`. A pharma manufacturer does not publish
pricing tiers for cartons or post job ads for packaging, so budget scores 0/25 on
every row by construction. Authority scores 0-5/25 because it is derived from the
contact finder, which returned nothing. The grades are an artifact of the model,
not a measurement of the prospects.

**There is no discovery.** `discover-prospects.mjs` reads a `urls.txt`. Three URLs
were fed in by hand. Nothing searches, nothing ranks a market, nothing decides who
to approach. It is an enrichment script, not a prospecting agent.

**What was right:** no email was sent, the rows are `is_verified=false` and status
`drafted`, and outbound is a separate RLS-locked table. The safety design is sound.
The lead generation is not.

**For whoever picks this up:** the gap is contact discovery and a corrugated-buyer
scoring model, in that order. Role inboxes and D grades are not worth outreach, and
sending to them from the Resend domain risks the sending reputation for nothing.

### 2026-08-21 - Claude (Opus 5) - DONE  [LEAD PIPELINE REBUILD]

**Did:** Rebuilt the outbound pipeline so it produces leads someone can actually
call, and rebuilt the dashboard around what it produces. Pushed the earlier
contact/map/quote commit to production.

**WHY THE OLD PIPELINE PRODUCED NOTHING** (audited before touching it, see the
audit entry above): `scripts/discover-prospects.mjs` read a hand-written
`urls.txt` - there was no discovery at all - and scored with the plugin's SaaS
BANT model, which derives budget from `pricing_tiers.length > 0` and timeline
from `has_job_postings`. A pharma plant publishes neither for cartons, so budget
scored 0/25 on every row **by construction**. All three prospects graded D with
zero named contacts and zero phone numbers. That script is now deleted.

**THE NEW PIPELINE** - `scripts/leads/`, documented in its own README:

  discover -> enrich -> score -> store, and it never sends anything.

- **Discovery is factoriesindia.net.** This was the find of the session. It is a
  **server-rendered** register of licensed Indian factories - company, phone,
  plant address, district, website, all in plain HTML - indexed as
  `/{industry}-factories-in-{district}/district` with `?page=N`. No API key, no
  JS rendering. Sources that were evaluated and rejected:
    * `ipass.telangana.gov.in` - best data on paper (named contact emails plus
      official investment and employment figures) but it is ASP.NET WebForms
      behind `__doPostBack`, the district filter returned 0 rows on a hand-built
      postback, and the 22 MB home page contains no drilldown links to harvest.
      One working `?enc=` slice exists via Exa's index; that is all.
    * `dca.telangana.gov.in/open_record.php?ID=N` - authoritative licensed
      manufacturer register, enumerable by ID, but it serves **PDFs** and
      carries no phone or website.
    * Firecrawl MCP - keyless access is disabled, needs an API key.
- **Enrichment** crawls the company's own site (never leaves the domain) for
  `tel:` links, emails ranked by whether they reach a purchase inbox, and named
  people paired with a buying title. `enrich.mjs` also exports `normalisePhone`.
- **Scoring** is `score.mjs`, and the weights are the argument: proximity 30,
  packaging fit 25, reachability 25, scale 20. Distance is heaviest on purpose -
  corrugated is bulky and cheap per kilo, so freight is a large slice of
  delivered cost. Competitors, no-location rows and out-of-area rows are
  disqualified outright rather than scored.

**RESULT, measured not claimed:** 28 companies, 22 with a phone number, graded
A-D with a stated reason per term. Before: 3 companies, 0 phones, 0 names, all D.

**EXTRACTION BUGS THAT ARE NOW REGRESSION TESTS** (`node scripts/leads/test.mjs`,
17 checks, no network - run it after touching any extractor):
1. Name/title pairing picked the **longer string** as the name, so "Managing
   Director" got filed as a person named Gopichand.
2. The title regexes run case-insensitively to catch "MANAGING DIRECTOR", which
   also let the *name* half match lowercase - "Gopichand i" became a contact.
   Capitalisation is now re-checked after the match.
3. Common-noun pairs beside a title: "Ware House, Executive" is a department.
   There is a long NOISE word list; add to it, do not loosen the pattern.
4. **"malkajgiri" was in the same-corridor locality list.** It is a district, so
   every Medchal-Malkajgiri plant scored as a next-door neighbour.
5. **`/\b50\d{4}\b/` matched every Telangana postcode**, so Sangareddy (502xxx)
   and Nalgonda (508xxx) plants scored as Greater Hyderabad. Named districts are
   now checked before any postcode heuristic; the city test is `50[01]xxx`.
6. The directory's own footer address `contact@factoriesindia.net` was being
   stored as the company's contact email.
7. The directory titles many rows by plant ("Plant 1", "Api Hyderabad 3", "Tea
   Factory"). The homepage `<title>` supplies a real name - but only when the
   directory name is *nothing but* a plant label. "Shilpa Medicare Ltd., Unit
   VII" gets its suffix stripped, not its name replaced.

**A BUG I CAUSED AND HAD TO REPAIR - do not repeat it:** the first `--rescore`
implementation re-crawled every site and **replaced** phones/emails with the
result. Run minutes after a full sweep, the same hosts throttled, most crawls
returned nothing, and it wiped real phone numbers off 20-odd rows in 27s. It now
feeds the stored numbers back in as input and **unions** old with new. Any
enrichment path that can return empty must merge, never replace.

**DASHBOARD** - `C:\qe-leads-dashboard`, still outside git, still 127.0.0.1 only,
service role still server-side.
- `server.js`: added `disqualified` status, human-only `is_verified` /
  `do_not_contact` patches, the new CSV columns, and `POST /api/pipeline/run`
  which spawns the sweep with **fixed arguments** - never take argv from the
  request, that endpoint must not become a shell.
- `index.html`: rewritten. Stat tiles, four single-series bar charts, filters,
  sortable table, detail drawer showing the score breakdown with its reasons and
  every phone/email/person beside the URL it came from, plus a copy-call-sheet
  button. Charts follow the `dataviz` skill: grade and distance are **ordinal**,
  so they wear a lightness-monotonic ramp of one hue, never a rainbow, and the
  grade chip always carries its letter so identity is never colour alone.
- Verified: 0 axe wcag2a/wcag2aa violations with the drawer open and closed,
  0 console errors, screenshot read at 1500px.

**RULES THIS PIPELINE MUST KEEP:**
1. Nothing is invented. Every phone, email and name stores its `source_url`. No
   source, no value.
2. `is_verified` and `do_not_contact` are human-only. The pipeline never writes
   them, so a scraped contact cannot mark itself safe to email.
3. Re-runs never overwrite human work - `status`, `notes`, `is_verified`,
   `do_not_contact` and `outreach_draft` are simply absent from the upsert.
4. Nothing is ever sent. A bad send from send.quality-enterprises.co.in costs the
   sending reputation that every real quote notification depends on.

**ON THE TWO REQUESTED THIRD PARTIES:** the ai-sales-team plugin's *skills* are
good (`sales-contacts` is a sound agent procedure); its *Python scripts* are the
weak part and are no longer used. Agent-Reach was read but not installed - it is
a capability layer for reading Twitter/Reddit/YouTube/LinkedIn, routing to
community CLIs, and the one thing it would add here (LinkedIn contact lookup)
needs a logged-in account and an alternate-account warning. Neither is what was
blocking lead quality; contact discovery and a domain-correct scoring model were.

**Files:** `scripts/leads/{run,enrich,score,test}.mjs`,
`scripts/leads/sources/factoriesindia.mjs`, `scripts/leads/README.md`,
`supabase/migrations/20260821200000_prospect_intelligence.sql`,
`scripts/discover-prospects.mjs` (deleted), `.env.example`;
plus local-only `C:\qe-leads-dashboard\{server.js,index.html}`.
Commits `9bb1bca`, `1f6c8b4` (both pushed), `35e0b8a`, `da5858c`.

**Left broken:** Vercel `QUOTE_NOTIFY_TO` - see CURRENT STATE. Coverage is thin
outside pharma; the directory simply lists fewer food/textile/plastic plants in
Telangana. Adding a second discovery source is the highest-value next move, and
`scripts/leads/README.md` documents the source-module contract for it.
