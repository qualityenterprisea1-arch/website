#!/usr/bin/env node
/* Cut the footage into finished vertical videos.
 *
 *   node scripts/social/edits.mjs                    print every edit spec
 *   node scripts/social/edits.mjs --spec blank-to-box
 *   node scripts/social/edits.mjs --render blank-to-box
 *   node scripts/social/edits.mjs --render all
 *
 * ffmpeg does the work — it is already on this machine, and it does everything
 * a 30-second vertical clip with burned-in text needs. No editor, no timeline,
 * no subscription, and the same input produces the same output every time,
 * which matters more than it sounds when the twelfth video has to match the
 * first.
 *
 * On-screen text is written here rather than lifted from the caption. A caption
 * sentence runs 150 characters; nobody reads that off a phone in three seconds.
 * These lines are three to seven words because that is what a person actually
 * takes in while the picture moves underneath.
 *
 * Sound: the clip's own audio is kept, because real machine noise is the thing
 * no library and no model has. Where a voiceover exists it is mixed on top and
 * the machine drops to a bed underneath.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { BANK, SHOTS, SEARCH } from "./bank.mjs";

const RAW = "social/footage/raw";
const VO = "social/footage/vo";
const OUT = "social/out";
const MANIFEST = "social/footage/manifest.json";
const FONT = process.env.QE_FONT || "Arial";

/* --------------------------------------------------------------- the edits */

/* [shot, on-screen line, seconds]. A null shot reuses the previous one, which
 * is how a single long take carries two beats without a visible cut. */
export const EDITS = {
  "flute-is-the-strength": [
    [4, "This is the strength.", 3],
    [4, "Not the paper. The wave.", 3],
    [5, "Bend it, glue a liner each side", 3.5],
    [5, "and it becomes columns.", 3],
    [10, "3 ply = 2 liners, 1 wave", 3.5],
    [10, "Crushed flutes = crushed box", 4],
  ],
  "blank-to-box": [
    [20, "Flat sheet.", 2],
    [20, "Watch.", 2],
    [20, null, 8],
    [20, "Every box ships flat.", 3],
    [20, "It becomes a box where you pack it.", 4],
  ],
  "ink-hitting-board": [
    [12, "Print goes on before the box exists.", 3.5],
    [12, null, 4],
    [13, "Flat sheet. Easy to register.", 3.5],
    [12, "Which is why artwork changes", 3],
    [12, "are cheap on Monday.", 3],
  ],
  "the-die-coming-down": [
    [17, "Watch this.", 2],
    [17, null, 5],
    [17, "A shaped blade set into plywood.", 3.5],
    [17, "Cuts and creases in one stroke.", 3.5],
    [17, "That is how a mailer gets made.", 3.5],
  ],
  "one-box-three-heights": [
    [15, "Extra crease lines.", 3],
    [15, "Same blank, three heights.", 3.5],
    [16, "One tooling.", 3],
    [16, "Three pack sizes.", 3],
    [16, "One SKU in the store room.", 3.5],
  ],
  "inside-ida-mallapur": [
    [1, "Twenty seconds.", 2],
    [4, "Paper becomes board.", 3],
    [9, "Board becomes sheets.", 3],
    [12, "Sheets get printed.", 3],
    [17, "Blanks get cut.", 3],
    [19, "Corners get stitched.", 3],
    [21, "IDA Mallapur, Hyderabad.", 3.5],
  ],
  "the-stack-test": [
    [21, "The bottom box carries everything.", 3.5],
    [21, null, 3],
    [21, "For the whole journey.", 3],
    [21, "Damp weakens it.", 3],
    [21, "Time under load weakens it.", 3.5],
    [21, "So does one box sitting crooked.", 4],
  ],
  "loading-out": [
    [22, "Flat. Strapped. Counted.", 3],
    [22, null, 4],
    [21, "This is what a delivery looks like", 3.5],
    [21, "before it becomes a problem.", 3.5],
    [22, "Hyderabad and the Telangana belt.", 3.5],
  ],
  "flute-direction": [
    [10, "Turn the board 90 degrees", 3],
    [10, "and it loses most of its strength.", 3.5],
    [5, "Flutes are columns.", 3],
    [5, "Standing up, they carry a stack.", 3.5],
    [5, "Lying down, they fold.", 3],
    [10, "Look at any carton's cut edge.", 4],
  ],
  "the-waste-skeleton": [
    [18, "This never becomes a box.", 3],
    [18, null, 4],
    [18, "The offcut comes away in one piece.", 3.5],
    [18, "Back for recycling, not the bin.", 3.5],
    [18, "And you pay for this stage.", 3.5],
  ],
  "corner-fails-first": [
    [19, "A box fails here.", 3],
    [19, "Not in the middle of the panel.", 3.5],
    [20, "The corners carry the load.", 3.5],
    [20, "The flat panels barely do.", 3.5],
    [19, "Which is why the joint matters.", 3.5],
  ],
  "machine-sound-only": [
    [4, "Sound on.", 2.5],
    [4, null, 8],
    [9, null, 7],
    [19, null, 7],
    [19, "Mon-Sat, 9:30 to 18:30.", 3],
  ],
  "glue-or-stitch": [
    [19, "Two ways to close a seam.", 3],
    [19, "Stitched: wire through the overlap.", 3.5],
    [19, "Strong in shear. Survives damp.", 3.5],
    [6, "Glued: flat, clean, nothing to catch.", 3.5],
    [6, "Better for a retail shelf.", 3],
    [6, "Neither is better in general.", 3.5],
  ],
  "reels-arriving": [
    [1, "Before it is a box", 3],
    [1, "it is a roll of paper this big.", 3.5],
    [2, null, 3],
    [3, "The paper in sets the strength out.", 4],
    [1, "Ask what paper you are quoted.", 3.5],
  ],
  "monsoon-and-board": [
    [21, "Board weakens before it looks wet.", 3.5],
    [10, "Paper and starch both take up damp.", 3.5],
    [10, "The flutes soften.", 3],
    [21, "Stored on a wet floor?", 3],
    [21, "Weaker before it is ever packed.", 3.5],
    [21, "Keep stock off the floor.", 3.5],
  ],
  "print-check-against-artwork": [
    [14, "First sheet off the run.", 3],
    [14, "Held up to the light.", 3],
    [12, "Registration. Colour. Position.", 3.5],
    [14, "Checked now, not at the thousandth.", 3.5],
    [14, "Send vector artwork where you can.", 3.5],
  ],
  "bursting-strength-vs-ect": [
    [null, "Two numbers. Not the same thing.", 3.5],
    [null, "Bursting strength: pushing through.", 3.5],
    [null, "Tells you about rough handling.", 3],
    [null, "Edge crush: load on its edge.", 3.5],
    [null, "That one predicts stacking.", 3],
    [null, "Ask which you are being quoted.", 3.5],
  ],
  "hands-squaring-a-stack": [
    [11, "Small thing.", 2.5],
    [11, "Decides whether the next machine jams.", 3.5],
    [9, "Every machine wants it square.", 3.5],
    [11, "Done a hundred times a day", 3],
    [11, "by people who call it nothing.", 3.5],
  ],
  "stacking-height-is-a-spec": [
    [21, "How high do you stack?", 3],
    [21, "Most people never say.", 3],
    [22, "The bottom box holds it all.", 3.5],
    [21, "And board creeps under load.", 3.5],
    [21, "Fine on day one, gone by week three.", 4],
  ],
  "nine-stages-in-thirty-seconds": [
    [4, "Corrugating", 3],
    [9, "Cutting", 3],
    [12, "Printing", 3],
    [15, "Scoring", 3],
    [16, "Slotting", 3],
    [17, "Punching", 3],
    [18, "Waste out", 3],
    [19, "Stitching", 3],
    [22, "Out the door.", 3.5],
  ],
  "kraft-vs-recycled-liner": [
    [1, "Same colour. Not the same paper.", 3.5],
    [2, "Virgin kraft: long fibres.", 3],
    [2, "Stronger for its weight.", 3],
    [10, "Recycled: shorter fibres, cheaper.", 3.5],
    [10, "Often entirely enough.", 3],
    [1, "Just know which you bought.", 3.5],
  ],
  "behind-the-four-hour-quote": [
    [9, "Four hours is not a delay.", 3],
    [9, "It is the work.", 2.5],
    [11, "Board grade against weight and journey.", 4],
    [11, "Blank size back from your internals.", 3.5],
    [21, "Board, setup and delivery costed.", 3.5],
    [21, "Then in writing, so you can hold us to it.", 4],
  ],
  "top-flap-gap": [
    [16, "See that gap?", 2.5],
    [16, "The box is the wrong width.", 3],
    [20, "Outer flaps should nearly touch.", 3.5],
    [20, "A gap means tape does the work", 3.5],
    [20, "that the board should be doing.", 3.5],
  ],
  "when-lighter-board-is-enough": [
    [10, "Sometimes the honest quote", 3],
    [10, "is the cheaper one.", 2.5],
    [10, "If the journey does not need 5 ply,", 3.5],
    [21, "we quote the 3 ply.", 3],
    [21, "Upgrading every enquiry protects margin,", 4],
    [21, "not your goods.", 3],
  ],
  /* Talking head. The beats are only a fallback shape — the real timing comes
     from Higgsfield's transcription of what was actually said, and the captions
     are the speech, not these lines. */
  "how-you-know-it-holds": [
    [19, "How do you know it will hold?", 2],
    [19, null, 12],
    [20, null, 8],
  ],
  "what-customers-get-wrong": [
    [11, "What do people get wrong?", 2],
    [11, null, 12],
    [9, null, 8],
  ],
  "hardest-job-this-month": [
    [17, "The hardest job this month.", 2],
    [17, null, 12],
    [20, null, 8],
  ],
};



/* ------------------------------------------------------ pacing and hooks */

/* How a piece is cut, and what it opens with.
 *
 * Short-form grammar is not one thing, and treating it as one is the usual
 * mistake. Two modes earn their place here:
 *
 *   fast   Spec, listicle and myth-busting content. The text is the substance
 *          and the picture is wallpaper, so beats run 1.6-2.2s and the cuts are
 *          hard. Slower than that and the viewer has read the line and is still
 *          waiting, which is exactly when a thumb moves.
 *   hold   Process, machinery and anything satisfying. The picture IS the
 *          substance. Cutting this fast destroys it — the whole appeal of a die
 *          closing or sheets dropping is watching it complete. Beats stay long
 *          and the text gets out of the way.
 *   talk   Somebody speaking. Higgsfield transcribes and captions it, so the
 *          timing comes from the speech, not from here.
 *
 * "How it's made" is one of the most durable organic formats there is, and this
 * factory can produce it truthfully. That is the honest overlap between what
 * travels and what reaches a purchase manager — and it is why the `hold` pieces
 * are the ones to put money behind, not the spec explainers.
 *
 * `loop` marks a piece whose last frame can cut back to its first without a
 * visible seam. A seamless loop is watched twice by a meaningful share of
 * viewers, and watch time is most of what distribution is decided on.
 *
 * `hooks` are alternates for the opening line. Testing the first 1.5 seconds is
 * the highest-leverage thing available in this whole system: the same video with
 * a different opening line routinely does several times the reach. Post one,
 * note which travelled, and put the winner in the bank.
 */
export const META = {
  "flute-is-the-strength":       { pace: "hold", audio: "machine", loop: false, hooks: ["Your box is not made of paper.", "This wave is doing all the work."] },
  "blank-to-box":                { pace: "hold", audio: "machine", loop: true,  hooks: ["Flat sheet to box, no cuts.", "Eight seconds. Watch the hands."] },
  "ink-hitting-board":           { pace: "hold", audio: "machine", loop: true,  hooks: ["Colour going onto brown.", "This is why artwork changes cost money."] },
  "the-die-coming-down":         { pace: "hold", audio: "machine", loop: true,  hooks: ["Half speed. Sound on.", "One stroke. Whole box."] },
  "one-box-three-heights":       { pace: "fast", audio: "trending", loop: false, hooks: ["One box. Three heights.", "Stop buying three cartons."] },
  "inside-ida-mallapur":         { pace: "hold", audio: "machine", loop: false, hooks: ["Twenty seconds inside a box factory.", "Paper goes in. Boxes come out."] },
  "the-stack-test":              { pace: "fast", audio: "trending", loop: false, hooks: ["The bottom box carries everything.", "Your stack is failing from the bottom."] },
  "loading-out":                 { pace: "hold", audio: "machine", loop: false, hooks: ["End of a run.", "This is what 500 boxes looks like."] },
  "flute-direction":             { pace: "fast", audio: "trending", loop: false, hooks: ["Turn it 90 degrees and it collapses.", "You are stacking them the wrong way."] },
  "the-waste-skeleton":          { pace: "hold", audio: "machine", loop: true,  hooks: ["The part that never becomes a box.", "Nobody outside the trade has seen this."] },
  "corner-fails-first":          { pace: "fast", audio: "trending", loop: false, hooks: ["Boxes never fail where you think.", "Not the panel. The corner."] },
  "machine-sound-only":          { pace: "hold", audio: "machine", loop: true,  hooks: ["Sound on. No music.", "Thirty seconds of a corrugator."] },
  "glue-or-stitch":              { pace: "fast", audio: "trending", loop: false, hooks: ["Glue or staples?", "Two joints. They fail differently."] },
  "reels-arriving":              { pace: "hold", audio: "machine", loop: false, hooks: ["Before it is a box.", "This roll becomes 4,000 cartons."] },
  "monsoon-and-board":           { pace: "fast", audio: "trending", loop: false, hooks: ["Your boxes are weaker than you think.", "Damp kills a carton before it is packed."] },
  "print-check-against-artwork": { pace: "hold", audio: "machine", loop: false, hooks: ["First sheet off the run.", "Checked at sheet one, not sheet 1,000."] },
  "bursting-strength-vs-ect":    { pace: "fast", audio: "trending", loop: false, hooks: ["Two numbers. People quote the wrong one.", "Burst or crush — which were you quoted?"] },
  "hands-squaring-a-stack":      { pace: "hold", audio: "machine", loop: true,  hooks: ["The smallest job on the floor.", "Skip this and the next machine jams."] },
  "stacking-height-is-a-spec":   { pace: "fast", audio: "trending", loop: false, hooks: ["Nobody tells their supplier this.", "How high do you stack? It matters."] },
  "nine-stages-in-thirty-seconds": { pace: "hold", audio: "machine", loop: true, hooks: ["Nine machines. Thirty seconds.", "Paper to pallet, start to finish."] },
  "kraft-vs-recycled-liner":     { pace: "fast", audio: "trending", loop: false, hooks: ["Same colour. Different paper.", "You may not be buying what you think."] },
  "behind-the-four-hour-quote":  { pace: "fast", audio: "trending", loop: false, hooks: ["What happens in those four hours.", "A quote is not a guess."] },
  "top-flap-gap":                { pace: "fast", audio: "trending", loop: false, hooks: ["See that gap? Wrong box.", "If the flaps do not meet, tape is doing the work."] },
  "when-lighter-board-is-enough":{ pace: "fast", audio: "trending", loop: false, hooks: ["We talk customers down to cheaper board.", "You probably do not need 5 ply."] },
  "how-you-know-it-holds":       { pace: "talk", audio: "voice", loop: false, hooks: ["We asked the man who runs the machine.", "How do you know it will hold?"] },
  "what-customers-get-wrong":    { pace: "talk", audio: "voice", loop: false, hooks: ["The mistake we see every week.", "Most enquiries are missing one thing."] },
  "hardest-job-this-month":      { pace: "talk", audio: "voice", loop: false, hooks: ["Not every job is a brown box.", "The hardest one we ran this month."] },
};

/* Beat timings per mode. The opening beat is always the shortest: the first
 * second and a half decides whether there is a second and a half. */
const PACING = {
  fast: { hook: 1.4, max: 2.2, min: 1.6 },
  hold: { hook: 1.8, max: 6.0, min: 2.0 },
  talk: { hook: 1.8, max: 6.0, min: 2.0 },
};

/** Retime an authored beat list for its mode. */
function applyPace(beats, pace) {
  const p = PACING[pace] ?? PACING.hold;
  return beats.map((b, i) => ({
    ...b,
    secs: i === 0 ? p.hook : +Math.min(Math.max(b.secs, p.min), p.max).toFixed(2),
  }));
}

/* ---------------------------------------------------------------- the spec */

export function spec(entry) {
  const beats = EDITS[entry.slug];
  if (!beats) return null;
  const meta = META[entry.slug] ?? { pace: "hold", audio: "machine", loop: false, hooks: [] };
  let last = null;
  const resolved = applyPace(beats.map(([shot, text, secs]) => {
    if (shot != null) last = shot;
    return { shot: last, text, secs };
  }), meta.pace);
  const total = +resolved.reduce((a, b) => a + b.secs, 0).toFixed(1);
  const vo = !!SEARCH[entry.slug]?.vo && meta.pace !== "fast";
  /* The voice says what is on screen, not what is in the caption. Reading the
     caption body aloud overruns every time — it was written to be read at your
     own pace, not spoken against a picture. Taking the beats instead means the
     script is timed to the cut by construction. */
  const script = resolved.filter((b) => b.text).map((b) => b.text);
  // Roughly 2.5 words a second is a clear, unhurried read.
  const words = script.join(" ").split(/\s+/).length;

  return {
    slug: entry.slug,
    title: entry.title,
    source: entry.source,
    hf: entry.hf ?? null,
    pace: meta.pace,
    audio: meta.audio,
    loop: !!meta.loop,
    hooks: [entry.hook, ...(meta.hooks ?? [])],
    total,
    /* A voiceover belongs to the pieces that have room for it. A `fast` cut runs
       10-12 seconds and its on-screen text is already the narration — dubbing a
       three-paragraph script over it would need someone to read at a gabble.
       So VO is for `hold` and `talk` only, whatever SEARCH asked for. */
    vo,
    voScript: vo ? script : null,
    voFits: vo ? words / 2.5 <= total : null,
    voSeconds: vo ? +(words / 2.5).toFixed(1) : null,
    beats: resolved,
  };
}

/* --------------------------------------------------------------- subtitles */

/* ASS rather than drawtext: one filter for the whole video, real wrapping, and
 * a styling block that can be changed in one place instead of in every call. */
function ass(sp) {
  const t = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), rest = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${rest.toFixed(2).padStart(5, "0")}`;
  };
  let at = 0;
  const events = [];
  for (const b of sp.beats) {
    if (b.text) {
      // A beat's text sits slightly inside the frame edge and clear of the
      // platform's own UI, which eats roughly the bottom fifth of a reel.
      events.push(`Dialogue: 0,${t(at + 0.15)},${t(at + b.secs - 0.15)},Main,,0,0,0,,${b.text.replace(/\n/g, "\\N")}`);
    }
    at += b.secs;
  }
  return [
    "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "",
    "[V4+ Styles]",
    "Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding",
    // White type, hard black outline, no box: readable over dark machinery and
    // over bright kraft alike, which a coloured panel is not.
    `Style: Main,${FONT},92,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,1,0,1,6,2,2,90,90,340,1`, "",
    "[Events]",
    "Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text",
    ...events,
  ].join("\n");
}

/* ----------------------------------------------------------------- ffmpeg */

const ff = (args, cwd) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { cwd, stdio: "inherit" });

function sources() {
  if (!existsSync(MANIFEST)) {
    console.error(`No footage manifest. Run: node scripts/social/assets.mjs --index`);
    process.exit(1);
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const byShot = new Map();
  for (const c of m.clips) if (!c.flagged && !byShot.has(c.shot)) byShot.set(c.shot, resolve(RAW, c.file));
  return byShot;
}

function render(entry) {
  const sp = spec(entry);
  if (!sp) { console.error(`No edit spec for ${entry.slug}`); return; }
  if (sp.source === "generated") {
    console.error(`${entry.slug} is a generated piece — build it with higgsfield.mjs, not from footage.`);
    return;
  }
  /* Speech has to be transcribed before it can be captioned, and ffmpeg cannot
     do that. These go through Higgsfield's editor, which also strips the filler
     and handles the fact that the answer is in Telugu or Hindi. */
  if (sp.pace === "talk") {
    console.error(`${entry.slug} is a talking-head piece — run it through the Higgsfield editor (see: higgsfield.mjs --plan).`);
    return;
  }
  if (sp.loop && sp.beats[0].shot !== sp.beats[sp.beats.length - 1].shot) {
    console.error(`  note: ${entry.slug} is marked to loop but opens on shot ${sp.beats[0].shot} and closes on ${sp.beats[sp.beats.length - 1].shot} — the seam will show.`);
  }

  const byShot = sources();
  const missing = [...new Set(sp.beats.map((b) => b.shot))].filter((s) => !byShot.has(s));
  if (missing.length) { console.error(`${entry.slug}: missing shot ${missing.join(", ")}`); return; }

  mkdirSync(OUT, { recursive: true });
  const work = join(OUT, `.${entry.slug}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  /* Every segment is normalised to the same size, framerate and audio layout
     first. Concat refuses to join streams that differ in any of those, and the
     failure message does not say which one. */
  const list = [];
  sp.beats.forEach((b, i) => {
    const seg = `seg${String(i).padStart(2, "0")}.mp4`;
    ff([
      // Two seconds in, past the moment the hand was still on the record button.
      "-ss", "2", "-t", String(b.secs), "-i", byShot.get(b.shot),
      "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "160k",
      join(work, seg),
    ]);
    list.push(`file '${seg}'`);
  });

  writeFileSync(join(work, "list.txt"), list.join("\n"));
  writeFileSync(join(work, "subs.ass"), ass(sp));

  /* Run the final pass from inside the working directory: ffmpeg's subtitles
     filter takes a filter-graph string, where a Windows path's colon and
     backslashes each need escaping. A bare filename needs none. */
  const voFile = join(VO, `${entry.slug}.m4a`);
  const hasVo = existsSync(voFile);
  const args = ["-f", "concat", "-safe", "0", "-i", "list.txt"];
  if (hasVo) args.push("-i", resolve(voFile));

  args.push("-vf", "subtitles=subs.ass");
  if (hasVo) {
    // Machine sound drops to a bed so the voice sits on top of the room rather
    // than replacing it. Losing the room entirely is what makes a factory video
    // sound like stock footage.
    args.push("-filter_complex", "[0:a]volume=0.18[bed];[1:a]volume=1.0[vo];[bed][vo]amix=inputs=2:duration=first:dropout_transition=0[a]", "-map", "0:v", "-map", "[a]");
  }
  args.push("-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            resolve(OUT, `${entry.slug}.mp4`));

  ff(args, work);
  rmSync(work, { recursive: true, force: true });
  console.log(`${OUT}/${entry.slug}.mp4  ${sp.total}s${hasVo ? "  (with voiceover)" : ""}`);
}

/* -------------------------------------------------------------------- cli */
/* Guarded: higgsfield.mjs imports spec() from this module, and without the
   guard that import would run the whole command-line program as a side effect. */
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {


const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? (argv[i + 1] ?? true) : null; };

const videos = BANK.filter((b) => b.kind === "video");
const target = flag("render") || flag("spec");

if (flag("render") === "all") {
  for (const v of videos.filter((v) => v.source !== "generated")) { try { render(v); } catch (e) { console.error(`${v.slug}: ${e.message}`); } }
} else if (flag("render")) {
  const v = videos.find((x) => x.slug === target);
  if (!v) { console.error(`No video called ${target}`); process.exit(1); }
  render(v);
} else {
  const show = target ? videos.filter((v) => v.slug === target) : videos;
  for (const v of show) {
    const sp = spec(v);
    if (!sp) { console.log(`\n${v.slug} — NO EDIT SPEC`); continue; }
    const badges = [`${sp.total}s`, sp.pace, `audio: ${sp.audio}`];
    if (sp.loop) badges.push("loops");
    if (sp.hf) badges.push(`higgsfield: ${sp.hf}`);
    console.log(`\n── ${sp.title}  [${badges.join(" · ")}]`);
    if (sp.hooks.length > 1) {
      console.log("   hooks to test (post one, keep the winner):");
      sp.hooks.forEach((h, i) => console.log(`     ${i === 0 ? "A" : String.fromCharCode(65 + i)}. ${h}`));
    }
    for (const b of sp.beats) {
      const shot = b.shot == null ? "gen " : `s${String(b.shot).padStart(2, "0")}`;
      console.log(`   ${shot}  ${String(b.secs).padStart(4)}s  ${b.text ?? "(no text — let the picture run)"}`);
      if (b.shot != null && SHOTS[b.shot]) console.log(`          ${SHOTS[b.shot].label}`);
    }
    if (sp.voScript) {
      console.log(`   voiceover (~${sp.voSeconds}s of speech into ${sp.total}s of picture${sp.voFits ? "" : " — TOO LONG, cut a line"}):`);
      for (const line of sp.voScript) console.log(`     ${line}`);
    }
  }
  const noSpec = videos.filter((v) => !EDITS[v.slug]);
  if (noSpec.length) console.log(`\nNo spec yet: ${noSpec.map((v) => v.slug).join(", ")}`);
}

}
