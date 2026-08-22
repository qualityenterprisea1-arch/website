#!/usr/bin/env node
/* Higgsfield's three jobs.
 *
 *   node scripts/social/higgsfield.mjs --plan        the worklist, app and API
 *   node scripts/social/higgsfield.mjs --dry         what would be sent to the API
 *   node --env-file=… scripts/social/higgsfield.mjs  submit and poll
 *
 * Higgsfield does three things here, and they are not interchangeable:
 *
 *   image    The five diagrams that have to be drawn rather than typeset —
 *            flute profiles, a wall cross-section, a dimensioned box, a
 *            partition grid, a delivery map. The typographic slides are still
 *            rendered by slides.mjs; these five are the ones that need a
 *            drawing. Use a text-accurate model, not a photoreal one.
 *   video    One animated diagram (burst vs edge crush). No footage exists of a
 *            board being crushed in a lab, and nor should it be implied.
 *   edit     The three talking-head pieces. The answers are in Telugu or Hindi
 *            and ffmpeg cannot transcribe, so Higgsfield's editor does the
 *            transcription, the captions, the filler strip and the reframe.
 *            That work is in their web app, not on the API — this script prints
 *            the worklist for it rather than pretending to automate it.
 *
 * And one job it will not do: generate footage of a factory floor. Every piece
 * marked `footage` is cut from the real one. A generated corrugator posted from
 * this account is a claim about a floor that was never filmed, and the purchase
 * managers this is aimed at buy cartons every week.
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BANK } from "./bank.mjs";
import { spec } from "./edits.mjs";

const API = "https://platform.higgsfield.ai";
const OUT = "social/out/generated";

/* Model paths are configurable because Higgsfield adds and renames them faster
 * than this file will be edited. The defaults reflect the split that matters:
 * anything carrying readable labels goes to a text-accurate model, never to a
 * photoreal one, because a diagram with a garbled "E FLUTE" is worse than no
 * diagram. Check the current path in their docs before the first run. */
const IMAGE_MODEL = process.env.HF_IMAGE_MODEL || "higgsfield-ai/nano-banana-pro";
const VIDEO_MODEL = process.env.HF_VIDEO_MODEL || "higgsfield-ai/image2video";

const has = (n) => process.argv.includes(`--${n}`);
const flag = (n, d = null) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d;
};

const ID = process.env.HF_API_KEY_ID || "";
const SECRET = process.env.HF_API_KEY_SECRET || "";
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/* ------------------------------------------------------------------- plan */

/* Shots most likely to need a cleanup pass before they enter the ffmpeg cut:
 * handheld, close, and lit by whatever the factory roof lets in. */
const CLEANUP_SHOTS = [4, 5, 6, 7, 8, 12, 15, 16, 17, 18, 19];

if (has("plan")) {
  const byJob = { image: [], video: [], edit: [] };
  for (const e of BANK) if (e.hf) byJob[e.hf]?.push(e);

  console.log(`\nHIGGSFIELD WORKLIST\n${"=".repeat(60)}`);

  console.log(`\n1. IN THE APP — the editor, ${byJob.edit.length} talking-head pieces`);
  console.log(`   Upload the interview clip, then: transcribe, generate captions,`);
  console.log(`   strip silence and filler, reframe to 9:16 with subject tracking.`);
  console.log(`   Keep the original language. Burn the captions in — most of these`);
  console.log(`   are watched on mute.\n`);
  for (const e of byJob.edit) {
    const sp = spec(e);
    console.log(`   · ${e.title}`);
    console.log(`     target ${sp?.total ?? "~15"}s · shots ${e.shots.join(", ")} for cutaways`);
  }

  console.log(`\n2. IN THE APP — cleanup pass, before ffmpeg`);
  console.log(`   Run these shots through stabilise / denoise / upscale, and save`);
  console.log(`   them back over the originals in social/footage/raw/.`);
  console.log(`   A factory floor is dim and a handheld phone shakes; the ffmpeg`);
  console.log(`   cut does a static centre crop and cannot fix either.`);
  console.log(`   Shots: ${CLEANUP_SHOTS.join(", ")}`);

  console.log(`\n3. ON THE API — ${byJob.image.length} diagrams, ${byJob.video.length} animated`);
  console.log(`   Run: node --env-file=… scripts/social/higgsfield.mjs`);
  for (const e of [...byJob.image, ...byJob.video]) console.log(`   · ${e.title}  [${e.hf}]`);

  console.log(`\n4. NOT HIGGSFIELD`);
  console.log(`   ${BANK.filter((e) => e.kind === "video" && !e.hf).length} videos cut by ffmpeg from real footage.`);
  console.log(`   ${BANK.filter((e) => e.kind === "post" && !e.hf).length} typographic slides rendered by slides.mjs.`);
  console.log(`   Neither needs a credit, and both are identical on every rerun.\n`);
  process.exit(0);
}

/* -------------------------------------------------------------- generation */

async function sb(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path}: ${(await res.text()).slice(0, 300)}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

const limit = Number(flag("limit", "6"));
const jobs = BANK.filter((e) => e.hf === "image" || e.hf === "video").slice(0, limit);

if (!jobs.length) { console.log("Nothing to generate."); process.exit(0); }

for (const e of jobs) {
  const isVideo = e.hf === "video";
  const model = isVideo ? VIDEO_MODEL : IMAGE_MODEL;
  console.log(`\n${e.title}  [${e.hf} · ${model}]\n  ${e.gen}`);
  if (has("dry")) continue;

  if (!ID || !SECRET) {
    console.error("HF_API_KEY_ID and HF_API_KEY_SECRET are required (or pass --dry).");
    process.exit(1);
  }

  const auth = { "hf-api-key": ID, "hf-secret": SECRET };
  const submit = await fetch(`${API}/${model}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    // 4:5 for a feed post, 9:16 for the one that is a reel.
    body: JSON.stringify({ params: { prompt: e.gen, aspect_ratio: isVideo ? "9:16" : "4:5" } }),
  });
  if (!submit.ok) { console.error(`  Higgsfield ${submit.status}: ${(await submit.text()).slice(0, 300)}`); continue; }

  const job = await submit.json();
  const statusUrl = job.status_url || `${API}/job-sets/${job.id}`;
  console.log(`  submitted ${job.id}`);

  /* Poll rather than webhook: this runs from a laptop with no public URL. Ten
     minutes then give up — the job id is stored either way, so a slow one can be
     collected later rather than paid for twice. */
  let out = null;
  for (let i = 0; i < 60 && !out; i++) {
    await new Promise((r) => setTimeout(r, 10_000));
    const res = await fetch(statusUrl, { headers: auth });
    if (!res.ok) continue;
    const state = await res.json();
    const done = (state.jobs || [state]).find((j) => j.status === "completed");
    if (done) out = done.results?.raw?.url || done.results?.min?.url || done.url;
    if ((state.jobs || [state]).some((j) => j.status === "failed")) {
      console.error(`  failed: ${JSON.stringify(state).slice(0, 200)}`);
      break;
    }
  }

  if (SUPABASE_URL && SERVICE_KEY) {
    const generation = { prompt: e.gen, model, job_id: job.id, status: out ? "done" : "pending", output_url: out || null, submitted_at: new Date().toISOString() };
    await sb(`social_posts?slug=eq.${e.slug}`, { method: "PATCH", body: JSON.stringify({ generation }) }).catch(() => {});
  }

  if (!out) { console.log("  still running — job id saved, collect it later."); continue; }

  /* Outputs expire after about a week on their side, so pull the file down now
     rather than storing a URL that quietly 404s next month. */
  mkdirSync(OUT, { recursive: true });
  const path = join(OUT, `${e.slug}.${isVideo ? "mp4" : "png"}`);
  if (!existsSync(path)) writeFileSync(path, Buffer.from(await (await fetch(out)).arrayBuffer()));
  console.log(`  saved ${path}`);
  console.log(`  CHECK THE TEXT before posting — a garbled label is worse than no diagram.`);
}
