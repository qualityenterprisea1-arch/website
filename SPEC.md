# BUILD SPEC — Quality Enterprises website

Hand this file to the implementing model as the single source of truth. Keep it in the repo root as `SPEC.md`. Update it after every session. Do not rely on chat history.

---

## 0. FILL THESE IN BEFORE BUILDING

Two blocks below are placeholders. Everything else is decided. If these are still `TODO` when the build starts, use the placeholder values but wrap every one in a `<!-- UNVERIFIED -->` HTML comment so they are trivially greppable later.

```
BRAND_NAME       = Quality Enterprises        # or trading name, if decided
DOMAIN           = quality-enterprises.co.in
FACTORY_ADDRESS  = Narsingi, Hyderabad, Telangana 500089
PHONE            = TODO
WHATSAPP         = TODO
EMAIL            = TODO
GSTIN            = TODO
HOURS            = Mon–Sat, 9:30–18:30
MOQ              = 500 boxes
QUOTE_SLA        = 4 working hours
```

```
# BOARD SPECS — TODO, currently invented. Do not ship invented values.
PLY_OPTIONS      = 3, 5, 7
FLUTE_PROFILES   = TODO   (placeholder: C-flute 4.0mm, B-flute 3.0mm)
LINER_GSM_RANGE  = TODO   (placeholder: 120–220 GSM)
BURSTING_3PLY    = TODO   (placeholder: 6–8 kg/cm²)
BURSTING_5PLY    = TODO   (placeholder: 10–14 kg/cm²)
BURSTING_7PLY    = TODO   (placeholder: 16–20 kg/cm²)
MAX_SHEET_SIZE   = TODO
PRINTING         = TODO   (in-house rubber-die flexo? colours? or outsourced offset?)
MONTHLY_CAPACITY = TODO

# BOX TYPES — replace with what the machines actually run.
1. RSC shipping boxes
2. Printed mailer boxes
3. Food & bakery boxes
4. Pizza boxes
5. Heavy duty cartons (double / triple wall)
6. Fruit & vegetable crates
7. Corrugated sheets, pads & partitions
8. Corrugated rolls & liners
```

---

## 1. WHAT THIS BUSINESS IS

A corrugated box manufacturing unit in Narsingi, Hyderabad. Two people. Own factory and machines — **not a trader**, and the site must make that obvious.

**The single differentiating fact: minimum order is 500 boxes.** Competing Hyderabad plants start at 5,000. That sentence is the positioning, the H1, and the reason anyone contacts us. Every page reinforces it.

**Audience:** D2C founders, cloud kitchens, small FMCG and apparel brands, e-commerce sellers, logistics firms — mostly in west Hyderabad (Gachibowli, Kokapet, Financial District, Manikonda). Mobile-first: assume ~85% of traffic is Android on 4G.

**The site's job** is credibility, not discovery. Leads come from IndiaMART, Google Business Profile and referrals. The site converts them by proving we're a real factory and making the quote request effortless.

**No prices anywhere.** Bulk quoting only. Never publish a rate card.

---

## 2. TECH STACK — DECIDED, DO NOT SUBSTITUTE

- **Next.js 15**, App Router, TypeScript, static generation
- **Tailwind CSS** — design tokens below go in `tailwind.config.ts`, not scattered arbitrary values
- **Supabase** — quote submissions only. One table, `quote_requests`. RLS on: anon can INSERT, nobody can SELECT.
- **anime.js v4** (`npm i animejs`) — used in exactly one component (§6). Nowhere else.
- **Vercel** hosting
- **next/image** for every raster image
- **No CMS.** Content lives in typed files under `/content/*.ts`.

### Explicitly banned
- No GSAP, no Lenis, no smooth-scroll hijacking. A purchase manager must be able to flick to the phone number instantly.
- No `localStorage` / `sessionStorage`.
- No Three.js / WebGL.
- No stock photography anywhere. Photo slots stay as visible labelled placeholders until real factory photos exist.
- No testimonials, client logos, or "trusted by" section. There are no clients yet. Do not invent or imply any.
- No `meta keywords` tag.
- No keyword-stuffed alt text. Alt text is a plain sentence describing the image.

---

## 3. DESIGN SYSTEM

### Palette
```css
--kraft:    #C69C6D;  /* primary surface, hero */
--kraft-lt: #E3D3BC;  /* page background */
--kraft-dp: #8B6740;  /* hard offset shadows, borders */
--ink:      #1A1613;  /* text, dark sections, outlines */
--ink-soft: #4A4038;  /* secondary text */
--ultra:    #1D3FBF;  /* accent — CTAs and highlights ONLY */
--paper:    #F7F4EF;  /* cards, light sections */
```
Wireframe section only (§6) overrides to: `--bone:#D7D4CB`, `--hair:#16150F`, `--acc:#D6402F`.

Rationale, so it isn't diluted: kraft is the material we make things from. Ultramarine is the ink used on shipping marks. Both come from the subject. Do not introduce gradients, glassmorphism, or a second accent.

### Typography
- **Display:** Anton — uppercase, `line-height: .92`, `letter-spacing: -.01em`. All headings, all big numbers.
- **Body:** Instrument Sans, 400–700, base 17px, `line-height: 1.55`.
- **Data:** Space Mono — every spec, dimension, GSM, eyebrow label, and technical caption. This is the rule that makes the site feel like a factory.

Type scale uses `clamp()` throughout. h1: `clamp(44px, 8.2vw, 104px)`. h2: `clamp(30px, 4.8vw, 58px)`.

### Component language (from the DuckPak reference)
- Cards: `border: 2px solid var(--ink)`, `border-radius: 18px`, hard offset shadow `6px 6px 0 var(--kraft-dp)` — never a soft blur.
- Buttons: fully rounded pills, 2px ink border, `translateY(-2px)` on hover.
- Generous whitespace. Section padding `clamp(56px, 8vw, 104px)`.
- Eyebrow labels: Space Mono, 12px, `.18em` tracking, uppercase, prefixed with a small ultramarine square.
- FAQ: bordered accordion cards, `+` / `–` in Anton and ultramarine.
- Alternating section backgrounds: kraft-lt → ink → paper → ink.

### Motion
CSS transitions only, except §6. Hover lifts, accordion opens, fade-up on scroll via IntersectionObserver. Respect `prefers-reduced-motion` everywhere — this is a hard requirement, not a nicety.

---

## 4. PAGES

```
/                      Home
/about                 About Us
/process               Our Process
/works                 Our Works
/boxes                 All box types (hub)
/boxes/[slug]          8 type pages
/contact               Contact Us
/quote                 Request a Quote (wizard)
```

Nav labels must match their destinations exactly. (The reference competitor site links "Our Clients" to `Careers.aspx` — that class of error is disqualifying.)

### `/` Home
Follow the DuckPak hero structure: **centred**, stacked headline, single primary CTA, horizontal card row beneath.

1. **Hero (centred).** Small eyebrow, then H1 stacked on two lines: `CUSTOM BOXES` / `FROM 500 UNITS.` with `500` in ultramarine. One-sentence subhead naming the audience. Primary CTA "Get a quote in 4 hours". Secondary text link "See what we make". Four Space Mono trust chips below.
2. **Box-type row.** Horizontal scroll on mobile, grid on desktop. Circular or rounded image slots per the reference. Links to `/boxes/[slug]`.
3. **MOQ strip.** Full-bleed ink band, one line: *Most plants in Hyderabad start at 5,000. We start at 500.*
4. **Board construction section** — the wireframe sequence, §6.
5. **Comparison table.** Two columns, "Typical Hyderabad plant" (✕) vs us (✓). Five rows: MOQ, quote turnaround, written spec sheet, pre-run sample, ply/GSM stated up front.
6. **Spec table.** Ply / wall / liner GSM / bursting strength / load capacity / best for. Horizontally scrollable on mobile.
7. **Factory band.** Three labelled photo placeholders. Copy: you're welcome to come and watch your run.
8. **FAQ accordion.** First question must be "Can I order fewer than 500 boxes?" — answered honestly, including why printed boxes can't go lower (fixed die cost).
9. **Quote CTA band** in ultramarine.

### `/about`
Who we are, the factory, why we take small orders. Short. No corporate filler — no "leading manufacturer of quality solutions". Concrete facts only. If a sentence would be true of any box company in India, delete it.

### `/process`
Nine stages: corrugation, cutting, printing, pasting, scoring, slotting, punching, stitching, waste management. Alternating image/text rows. **This page is a content moat** — competitors publish this as a wall of grey text. Write it with real technical detail (flute formation, gum ratios, die fitting, ply-based blade adjustment) presented cleanly. Photo slot per stage.

### `/works`
⚠️ There are no client projects yet. Do **not** build a fake portfolio. Build the page as a **capability gallery**: box formats we've produced, printing samples, size ranges. Add an honest empty state. Convert to case studies once real clients exist.

### `/boxes` + `/boxes/[slug]`
Hub grid of 8. Each type page: hero image, what it's for, available ply, size guidance, printing options, and a quote CTA pre-filled with that box type. Generate from `/content/boxTypes.ts`.

### `/contact`
Name / address / phone / email / GSTIN / hours, embedded map, tap-to-call and WhatsApp buttons. NAP text must match the Google Business Profile **character for character** — this matters for local SEO.

### `/quote` — most important page on the site
Stepped wizard, one question per screen, modelled on the reference's flow but **6 steps, not 11**:

1. Box type (cards)
2. Dimensions L × W × H, with an inches/mm toggle
3. Ply (3 / 5 / 7) with a plain-language hint per option
4. Quantity (min 500, with a note if they enter less)
5. Printing — none / 1 colour / 2 colour / full
6. Name, **phone (required)**, company, email (optional)

Persistent right-hand summary panel that fills in as they answer — that's the commitment device. On mobile it collapses to a sticky bottom bar showing the current spec.

Progress indicator. Back navigation preserves answers. Writes to Supabase, then a confirmation screen restating the 4-hour SLA. Every field captured is a question we don't have to ask on the phone.

---

## 5. MOBILE — FIRST, NOT LAST

Build every component at 375px first, then widen. Assume mid-range Android on 4G.

- **Sticky bottom bar on every page**, mobile only: two buttons, "Call" (kraft) and "Get a quote" (ultramarine). `tel:` and `wa.me` deep links. `body` gets matching bottom padding.
- Hamburger nav below 880px.
- Tap targets ≥ 44px.
- Tables scroll horizontally in a container; never shrink text to fit.
- Wizard is full-screen per step on mobile with a large Next button.
- Hero H1 must not exceed three lines at 375px.
- Images: `next/image`, AVIF/WebP, explicit width and height, lazy below the fold, `priority` on the hero only.

**Performance budget (hard gates):** LCP < 2.5s on Moto G Power / Slow 4G. CLS < 0.1. Total JS below the fold < 100KB gzipped. The board section (§6) must not be in the initial bundle.

---

## 6. BOARD CONSTRUCTION SECTION — the signature element

A scroll-scrubbed **wireframe technical illustration** of corrugated board separating into its layers. Reference: the anime.js homepage hero (exploded lens with leader-line callouts).

**Rules:**
- Second section on the homepage. **Never the hero** — it would destroy LCP.
- `next/dynamic` with `ssr: false`, lazy-loaded on intersection.
- Pure SVG. No canvas, no WebGL, no image sequence.
- Static SVG fallback if anime.js fails to load or `prefers-reduced-motion` is set. The fallback shows all layers and labels, no motion.
- Below 900px: simplify to a static labelled diagram. Do not run the scroll sequence on mobile.

**Visual treatment:** bone background `#D7D4CB`, hairline `#16150F` strokes, **no fills**. Heading + short paragraph pinned top-left. Leader lines fan from each layer to a monospace label column on the right, each anchored with a small dot. Instrument panel bottom-right (bordered, mono, tick ruler) showing live ply / construction / bursting strength / load capacity. Monochrome except `#D6402F`, used only on the currently highlighted layer.

**Geometry:** axonometric with depth offset `dx: 196, dy: -98`.
- Liners: wireframe slabs — front face, top face, right face; hidden back edges at reduced opacity.
- Flutes: front sine wave, back sine wave offset into depth, plus depth lines from each wave peak. The depth lines are what make it read as corrugation.
- Leader lines recalculate each frame as layers separate; label column stays at fixed even spacing.

**Sequence** — anime.js `createTimeline({autoplay:false})` linked via `onScroll({sync: 0.13})`, over ~600vh:
1. Assembled 3-ply, scales and tilts in
2. Layers separate, leader lines and labels fade in
3. Flutes highlight in accent, liners drop to 30% — *the flute carries the load*
4. Collapse → 5 ply, re-separate
5. → 7 ply, settle

A working prototype exists at `board-wireframe-sequence.html`. Port the geometry functions directly; don't re-derive them.

**Use this treatment once.** Repeating it turns the site into a portfolio piece and costs us credibility.

---

## 7. SEO / AEO

The goal is being cited by AI assistants and ranking locally, not keyword density.

**Schema (JSON-LD), required:**
- `Organization` + `LocalBusiness` sitewide — address, geo, phone, GSTIN, `openingHours`, and `sameAs` linking IndiaMART, Google Business Profile, LinkedIn
- `Product` on each box-type page — material, ply, `AggregateOffer` with `priceCurrency: "INR"` and `availability` (no price)
- `FAQPage` on home and relevant pages
- `BreadcrumbList` sitewide

**FAQ answers must be written as standalone direct answers** — the first sentence answers the question completely with no lead-in. That's the format AI assistants extract.

Unique `<title>` and meta description per page. Semantic HTML, one `<h1>` per page. `sitemap.xml` and `robots.txt`. Real anchor text, no "click here".

---

## 8. BUILD PHASES

Do not attempt in one pass. Stop and report at each phase boundary.

**Phase 1 — shippable.** Layout shell, nav, footer, design tokens, Home (hero, MOQ strip, comparison, spec table, FAQ, CTA), `/contact`, `/quote` wizard + Supabase, mobile sticky bar, schema. *Deployable and lead-capturing without any of the below.*

**Phase 2.** `/boxes` hub + 8 type pages from content files. `/about`. `/process`.

**Phase 3.** Board construction section (§6). Lazy, fallback-first.

**Phase 4.** `/works` capability gallery. Real factory photos swapped into all placeholders.

---

## 9. ACCEPTANCE CRITERIA

- [ ] "500" appears in the `<h1>`
- [ ] Sticky call/quote bar on every page under 880px
- [ ] Quote wizard writes to Supabase and confirms the 4-hour SLA
- [ ] Zero stock photos; every placeholder visibly labelled
- [ ] Zero testimonials or client claims
- [ ] Board section absent from the initial JS bundle
- [ ] Full keyboard navigation with visible focus rings
- [ ] `prefers-reduced-motion` disables all motion including §6
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO 100
- [ ] Every invented spec value tagged `<!-- UNVERIFIED -->`
- [ ] NAP identical across `/contact`, footer and schema

---

## 10. TONE OF COPY

Short sentences. Plain English. Specific over clever. Indian English spelling.

Write like a factory owner who knows his material, not a marketing agency. "We start at 500" beats "flexible minimum order quantities tailored to your business needs." Every claim should be checkable.

**Banned phrases:** leading manufacturer, quality solutions, customer-centric, world-class, one-stop shop, cutting-edge, seamless, unlock, elevate, empower.

---

## 11. BUILD TOOLING — verified 2026-08-20

Verified against the live session, not assumed. Re-verify if the session changes.

### Environment (checked, not guessed)
```
node 24.11.1 / npm 11.11.1     OK — Next.js 15 fine
vercel CLI                     INSTALLED (startup hook wrongly reported absent)
git 2.52.0                     installed, but repo NOT initialised — `git init` before Phase 1
supabase CLI                   NOT installed — use Supabase MCP, or `npx supabase` for local migrations
Supabase MCP                   AUTHED, 4 projects, none for this build. Create one in ap-south-1 (Mumbai).
Vercel MCP                     AUTHED (deploy, build logs, runtime errors, analytics)
```

### MCP — load-bearing
| MCP | Used for | Phase |
|---|---|---|
| **Supabase** | create project (ap-south-1), `quote_requests` table, RLS (anon INSERT only), `generate_typescript_types`, `get_advisors` to prove RLS is closed | 1 |
| **Vercel** | `deploy_to_vercel`, build logs, runtime errors, Web Analytics for real LCP | 1, all |
| **Playwright** | a11y-tree driven — keyboard path, focus rings, 375px layout, reduced-motion audit. This is how §9 gets verified rather than asserted | gate on every phase |
| **firecrawl / exa** | scrape DuckPak for exact component metrics; verify the "competitors start at 5,000" claim before publishing it (§10: every claim checkable) | 1 (copy), 3 |
| **github** | repo + CI once `git init` is done | 1 |

### MCP — connected but NOT for this build
posthog, sentry, stripe, linear, notion, canva, gmail, drive, motion, vyra, ide. No payments, no CMS, no video. Ignore.

### MCP — named in global CLAUDE.md but ABSENT this session
`context7`, `shadcn`, `chrome-devtools`, `n8n`, `prisma`. Do not plan around them.
- **context7 absent** → verify the anime.js v4 API against `node_modules/animejs` type definitions instead. Do not write v4 calls from memory.
- **chrome-devtools absent** → Playwright + Vercel Analytics + `next build` output cover the perf budget.
- **shadcn absent** → irrelevant anyway, see below.

### Skills — the actual shortlist
| Phase | Load | Why |
|---|---|---|
| 1 | `vercel:nextjs` | App Router + static generation, current API |
| 1 | `vercel:react-best-practices` | §5 perf budget is hard-gated |
| 1 | `claude-seo:seo-local` | §7 NAP-character-for-character + LocalBusiness. Highest-value SEO skill here |
| 1 | `claude-seo:seo-schema` | JSON-LD generate **and validate** — 5 schema types required |
| 1 | `vercel:env-vars` | Supabase keys, preview vs prod |
| 1, 4 | `marketing-skills:copywriting` | §10 tone. Constrain it with the banned-phrase list — do not let it write agency prose |
| 2 | `claude-seo:seo-geo` | §7 is explicitly about AI-assistant citation; drives the standalone-answer FAQ format |
| 3 | `animate` → **then** `animejs` | Judgment before API (per global CLAUDE.md). §6 only |
| 3 | `accessible-animation` | §9 gates on `prefers-reduced-motion`. Tiered patterns, not all-or-nothing |
| 3 | `svg-animation` + `60fps-animation` | §6 is pure SVG, scroll-scrubbed over 600vh — real layout-thrash risk |
| all | `web-design-guidelines` | Cheap pre-ship a11y pass toward Accessibility ≥ 95 |
| all | `full-output-enforcement` | Many files; blocks truncated/placeholder code |
| gate | `claude-seo:seo-audit`, `vercel:verification` | Phase-boundary gates |

### Skills deliberately NOT used
- **`ui-ux-pro-max`, `design-taste-frontend`** — palette, fonts and component language are decided in §3. These re-open settled decisions.
- **`shadcn`, `kokonutui`** — bespoke 2px-ink-border / hard-offset system; shadcn defaults fight it, KokonutUI drags in Motion, violating §2's one-animation-runtime rule. Accordion is `<details>/<summary>` natively.
- **all `gsap-skills:*`** — banned by §2. They self-recommend aggressively; ignore them.
- **`vercel:marketplace`, `vercel:vercel-storage`** — would route storage away from Supabase. §2 says decided, do not substitute.
- **`imagegen-frontend-web`, `image-to-code`** — §2 bans stock/generated imagery. Placeholders stay labelled until real factory photos exist.
- **`dataviz`** — spec/comparison tables are tables, not charts.
- **`industrial-brutalist-ui`** — tempting for §6, but §3 already specifies the wireframe treatment exactly. Would dilute it.

### Precedence note
Global `CLAUDE.md` says "search the shadcn registry before writing a component" and "load `marketplace` before recommending any external service". **This SPEC overrides both for this repo** (§2: DECIDED, DO NOT SUBSTITUTE).

### New blocker found
`board-wireframe-sequence.html` — referenced in §6 as an existing prototype to port geometry from — **is not in the repo**. Only `SPEC.md` is. Either supply it before Phase 3, or §6 geometry must be re-derived from scratch (materially larger job).

---

## 12. §6 BOARD SECTION — debug log (2026-08-20)

Prototype restored to `board-wireframe-sequence.html`; original kept as
`board-wireframe-sequence.broken.bak`. Geometry functions were correct throughout
and are ported verbatim — every fault was in the drive layer.

### Fixed and verified by Playwright
1. **`container: window` was fatal.** anime.js v4 calls `getComputedStyle(container)`;
   `window` is not an Element, so `onScroll()` threw. The throw landed in the script's
   own trailing `.catch()`, which silently swapped in the static fallback. Net effect:
   the sequence never ran once, on any load, with no console error. Fix: omit
   `container` entirely. Verified — all 5 beats now fire in order.
2. **`.call()` beats never reverted on scroll-up.** Ply/highlight/copy were `.call()`
   side effects, so scrubbing backwards left the panel stuck. Replaced with `.set()`
   on a `st.beat` value; `render()` is now a pure function of timeline progress.
   Verified — scrolling back up correctly returns 7 ply → 3 ply.
3. **Two writers fought over callout opacity.** `hi()` set it, then `leaders()`
   overwrote it every frame, so the "flute carries the load" dim never held.
   `leaders()` is now the sole writer.
4. **Per-frame DOM churn** — 22 ruler ticks were re-toggled every frame; now only the
   tick that changed. `display` writes only when ply changes.
5. **`will-change` now scoped** to `body.live` and released at sequence end.
6. **Mobile**: below 900px the library is never fetched (SPEC §6 compliance + keeps it
   out of the mobile bundle). Static path reframes the viewBox to `150 120 640 470`
   and moves labels to real HTML — the in-SVG label column is illegible at 375px.
7. Panel MOQ corrected to 500.

### OPEN — must fix before Phase 3
- **Observer stops driving the timeline after the sequence completes.** After reaching
  progress 1, scroll no longer updates it — frozen at the last beat even back at
  `scrollY 0`. Prime suspect: the ScrollObserver returned by `onScroll()` is never
  retained (`onScroll({...}).link(tl)` discards it), so it is collectable. Fix to try
  first: hold the observer in a variable that outlives the callback.
- **`sync: .13` overshoots on large scroll jumps** (scrollbar drag / End key) — lands
  several beats ahead and does not settle back. Continuous wheel scrolling tracks
  correctly. Re-tune `sync` or clamp once the freeze above is resolved.
- Not yet tested at 375px, nor under `prefers-reduced-motion`.
