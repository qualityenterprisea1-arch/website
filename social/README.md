# The content system

Two posts and two videos a week, thirteen weeks planned, five platforms, every
link traceable to the quote it produced.

It is built on the same rule as the lead pipeline: **it never publishes.** A
person copies the caption, posts it, and marks it posted. An account that posts
by itself gets one thing wrong at 2am and there is nobody there to catch it.

```
SHOOT.md ──► footage/raw ──► Higgsfield cleanup ──► assets.mjs ──► edits.mjs ──► out/*.mp4 ─┐
                                    │                                                        │
                             Higgsfield editor ──► the 3 talking-head pieces ────────────────┤
                                                                                             │
    bank.mjs ──► slides.mjs ──► out/<slug>/*.png ────────────────────────────────────────────┤
    bank.mjs ──► higgsfield.mjs ──► out/generated/*  (5 diagrams, 1 animated) ───────────────┤
                                                                                             ├──► /leads → Content ──► a human posts
    bank.mjs ──► platforms.mjs ──► plan.mjs ──► social_posts ────────────────────────────────┘         │
                        (5 captions, tags, alt text, YouTube SEO)                                      │
                                                                                                       │
                                             quote_requests.utm.utm_content = slug ◄───────────────────┘
```

## What runs when

| When | Command | Does |
|---|---|---|
| Before anything | `node scripts/social/higgsfield.mjs --plan` | The worklist: what happens in the Higgsfield app, what happens on the API, what needs neither |
| Once, after the shoot | `node scripts/social/assets.mjs --index` | Builds `footage/manifest.json`, guessing shot numbers from capture order |
| Any time | `node scripts/social/assets.mjs` | Which pieces can be cut today, and which shots are missing |
| Once a quarter | `node --env-file=… scripts/social/plan.mjs` | Writes thirteen weeks into `social_posts`, all five platform renderings included |
| Once, then per edit | `node scripts/social/slides.mjs --render all` | 19 typographic carousels and stills → `out/<slug>/*.png` |
| After the shoot | `node scripts/social/edits.mjs --render all` | 23 videos cut, captioned and mixed → `out/<slug>.mp4` |
| When credits allow | `node --env-file=… scripts/social/higgsfield.mjs` | The 5 drawn diagrams and the 1 animated one |
| Weekly | Open `/leads` → **Content** | Pick a platform, copy its caption, post, mark posted |

`plan.mjs --dry`, `edits.mjs` and `higgsfield.mjs --plan` all print without
touching anything. Start there.

## What travels, and what only looks like it does

Reach and revenue can point in opposite directions for a factory account. Two
hundred thousand views from people who will never buy a carton is worth less
than eight hundred views seen by twelve purchase managers, and the Content tab
counts quotes rather than views for exactly that reason.

The honest overlap is that **manufacturing process video is one of the most
durable organic formats there is**, and this factory can produce it truthfully.
So the system is built around two cutting modes, not one:

| Mode | Beats | Audio | For |
|---|---|---|---|
| **hold** | 2–6s, long holds | the machine, no music | Process, machinery, anything satisfying. The picture *is* the substance — cutting it fast destroys the thing people came to watch. 12 pieces. |
| **fast** | 1.4s hook, then 1.6–2.2s | trending audio is fine here | Spec, listicle, myth-busting. The text is the substance; the picture is wallpaper. Runs 10–12s. 12 pieces. |
| **talk** | speech-timed | the voice | The three interviews. Higgsfield transcribes and captions. |

Seven pieces are marked to **loop** — the last frame cuts back to the first
without a visible seam, which gets a meaningful share of viewers watching twice.
Watch time is most of what distribution is decided on.

**Hook testing is the highest-leverage thing in this whole system.** Every video
carries three alternate opening lines; `edits.mjs --spec <slug>` prints them.
The same video with a different first line routinely does several times the
reach. Post one, note which travelled, put the winner in the bank.

On trending audio: it changes weekly and cannot be planned a quarter ahead. Pick
it in the app on the day, from what is trending *in India*. And never put it on
a `hold` piece — the machine sound is the reason that piece works.

## Higgsfield's three jobs

| Job | Pieces | Why not the code |
|---|---|---|
| **edit** | 3 talking-head | The answers are in Telugu or Hindi. ffmpeg cannot transcribe, so it cannot caption speech. Higgsfield transcribes, captions, strips filler, and reframes with subject tracking. |
| **cleanup** | 11 shots | A factory floor is dim and a handheld phone shakes. The ffmpeg cut does a static centre crop and can fix neither. Run these through stabilise/denoise/upscale *before* indexing. |
| **image / video** | 5 diagrams + 1 animated | Flute profiles, a wall cross-section, a dimensioned box, a partition grid, a delivery map, and a burst-vs-crush animation. These have to be *drawn*, and no footage of them exists or should be implied. |

Use a **text-accurate model** for the diagrams — Nano Banana Pro or GPT Image,
not a photoreal one. A garbled `E FLUTE` is worse than no diagram, and the
script prints a reminder to check the text before posting. Set `HF_IMAGE_MODEL`
and `HF_VIDEO_MODEL` if the paths change.

And the one job it is never given: generating factory footage. Every piece
marked `footage` is cut from the real floor.

## No credits needed for most of it

- **23 videos** — ffmpeg. Cuts each beat, normalises to 1080×1920, burns the
  on-screen text from a generated ASS file, mixes any voiceover over the machine
  sound at a bed level.
- **19 carousels and stills** — the copy of headless Chrome Playwright already
  downloaded, screenshotting HTML laid out in the site's own type and colour,
  sliced with `sharp`. Exact type, identical on every rerun, no credit.

## Five platforms, five jobs

| | Fold | Tags | Link | What it optimises for |
|---|---|---|---|---|
| **Instagram** | ~125 chars | 6, per pillar | in bio | Hook in the first line; alt text filled in |
| **Facebook** | ~80 chars | 2 | inline | Short opener, clickable link |
| **LinkedIn** | ~200 chars | 3, CamelCase | first comment | Hook plus the answer above the fold; link kept out of the body |
| **YouTube** | title | 3 + #Shorts | inline | Title is the search query; description answers it in line one |
| **WhatsApp** | — | none | opens a chat | No hashtags, no pitch, message pre-written |

**The AEO layer is answer-first structure.** Every piece names the question a
buyer actually types (`SEARCH` in `bank.mjs`), the YouTube title is that
question, and the first line of the description answers it outright. A page that
buries its answer under a preamble cannot be quoted by a search result, an AI
overview or an assistant. Costs nothing, and it is most of the work.

## Voiceover

Almost nothing here has one, and that is deliberate. The `hold` pieces are
carried by machine sound; the `fast` pieces run 10–12 seconds and their
on-screen text already *is* the narration — dubbing a script over that needs
somebody to read at a gabble. The human voice on this channel comes from the
three interviews instead.

Where a piece does take one, the script is the on-screen beats rather than the
caption body, so it is timed to the cut by construction:

```bash
node scripts/social/edits.mjs --spec flute-is-the-strength   # prints the script and whether it fits
# record on a phone, quiet room, normal pace
# save as social/footage/vo/flute-is-the-strength.m4a
node scripts/social/edits.mjs --render flute-is-the-strength
```

## The three rules this enforces in code

1. **Nothing invented.** Captions are composed from parts in
   `scripts/social/bank.mjs` by string concatenation. No model writes copy at
   post time. Every claim is either a fact about how board behaves or something
   the site already commits to — the 500 minimum, the four-hour written quote,
   the nine stages.

2. **Generated is never presented as filmed.** `higgsfield.mjs` only touches
   pieces marked `image` or `video`, and `edits.mjs` refuses to cut a generated
   piece from footage or a talking-head piece without transcription. There is no
   path in this repo that produces an AI video of a corrugator and captions it
   as Plot 75A.

3. **Every link is measurable.** `utm_content` carries the piece's slug and
   `utm_source` carries the platform, so a quote arriving three weeks after a
   post still names both. The Content tab shows the count per piece, and
   `social_performance` joins it in SQL.

## The pillars

| Pillar | What it does | Roughly |
|---|---|---|
| **How a box works** | The mechanics — flutes, ply, joints, why board fails | Teaches; earns the follow |
| **Format file** | Which box for which job — RSC, mailer, FOL, partitions | Reaches people mid-decision |
| **Spec school** | How to buy without getting it wrong — measuring, GSM, samples | Highest intent; most of the quotes |
| **The real thing** | The floor running, and the people on it | Proof; the reason to believe the other three |

## After the thirteen weeks

Do not invent a new plan. Open the Content tab, sort by quotes, and look at what
the top five have in common — pillar, pace, hook shape, platform. Then rewrite
the bank with more of that and re-run `plan.mjs --refresh`. Thirteen weeks of
measured results beats any amount of planning done in advance, including this
file.

Put money behind the `hold` pieces before the `fast` ones. Process footage is
what a competitor cannot copy; a spec explainer is.

## Files

| File | Does |
|---|---|
| `SHOOT.md` | The one-visit shot list. Everything real starts here. |
| `scripts/social/bank.mjs` | Thirteen weeks of subjects and copy, the shot table, the search queries |
| `scripts/social/platforms.mjs` | Five renderings of one piece: folds, hashtags, links, YouTube SEO, alt text |
| `scripts/social/plan.mjs` | Composes everything and writes the queue |
| `scripts/social/links.mjs` | UTM and WhatsApp click-to-chat construction |
| `scripts/social/assets.mjs` | Indexes the footage, reports what is missing |
| `scripts/social/edits.mjs` | Edit specs, pacing modes, hook alternates, and the ffmpeg cut |
| `scripts/social/slides.mjs` | Carousels and stills → 1080×1350 PNG |
| `scripts/social/higgsfield.mjs` | `--plan` for the worklist; generates the drawn diagrams |
| `app/leads/LeadsDesk.tsx` | The Content tab — per-platform copy, alt text, mark posted |
