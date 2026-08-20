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
DATE           : 2026-08-20
LAST COMMIT    : 2192420  Baseline: spec + board wireframe prototype
BUILD PHASE    : Pre-Phase-1. No Next.js app scaffolded yet. Repo holds SPEC + prototype only.
WORKING        : board-wireframe-sequence.html — desktop scroll sequence, all 5 beats,
                 forward and backward scrub. Verified in Chrome at 1440x900.
BROKEN         : same file — observer stops driving the timeline after it completes (see
                 DEAD ENDS #4). Blocks SPEC Phase 3, blocks nothing else.
NEXT ACTION    : Either (a) fix the observer freeze, or (b) leave §6 alone and scaffold
                 Phase 1 — they are independent. (b) is worth more; §6 is Phase 3 and the
                 site is lead-capturing without it.
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

<!-- template for the next entry:

### YYYY-MM-DD · <agent> · IN PROGRESS | DONE | BLOCKED
**Did:**
**Files:**
**Verified how:**
**Left broken:**
**For the next agent:**

-->
