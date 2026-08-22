#!/usr/bin/env node
/* Index the footage from the one-visit shoot.
 *
 *   node scripts/social/assets.mjs --index      build the manifest
 *   node scripts/social/assets.mjs              read it back, show what is missing
 *
 * The shot list in social/SHOOT.md is walked in order, so the clips come off the
 * phone in that order too. That is the whole trick here: sort by capture time
 * and the nth video is shot n. It will be wrong wherever a shot was retaken or
 * skipped, which is why the manifest is a file you can edit rather than a
 * mapping computed fresh every run.
 *
 * Nothing here touches the network or the database. It answers one question:
 * which planned pieces can actually be made from what is on disk.
 */

import { readdirSync, statSync, existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { BANK } from "./bank.mjs";

const ROOT = "social/footage";
const RAW = join(ROOT, "raw");
const MANIFEST = join(ROOT, "manifest.json");
const VIDEO = new Set([".mov", ".mp4", ".m4v", ".avi", ".hevc"]);
const PHOTO = new Set([".jpg", ".jpeg", ".png", ".heic", ".heif", ".dng"]);

const has = (n) => process.argv.includes(`--${n}`);

function scan() {
  if (!existsSync(RAW)) {
    console.error(`No footage yet. Copy the shoot into ${RAW}\\ first — see social/SHOOT.md.`);
    process.exit(1);
  }
  const files = readdirSync(RAW)
    .map((name) => {
      const ext = extname(name).toLowerCase();
      const kind = VIDEO.has(ext) ? "video" : PHOTO.has(ext) ? "photo" : null;
      if (!kind) return null;
      const s = statSync(join(RAW, name));
      // Birth time is what the camera wrote; mtime survives a copy that btime
      // does not, so take whichever is earlier and non-zero.
      const at = Math.min(s.birthtimeMs || Infinity, s.mtimeMs);
      return { name, kind, bytes: s.size, at };
    })
    .filter(Boolean)
    .sort((a, b) => a.at - b.at);

  const videos = files.filter((f) => f.kind === "video");
  const photos = files.filter((f) => f.kind === "photo");
  return { videos, photos };
}

if (has("index")) {
  const { videos, photos } = scan();
  mkdirSync(ROOT, { recursive: true });
  const manifest = {
    built_at: new Date().toISOString(),
    note: "shot numbers are assigned by capture order and WILL be wrong where a shot was retaken. Fix them here; nothing else reads the filenames.",
    clips: videos.map((v, i) => ({ file: v.name, shot: i + 1, mb: +(v.bytes / 1e6).toFixed(1), flagged: false })),
    stills: photos.map((p, i) => ({ file: p.name, still: i + 1, mb: +(p.bytes / 1e6).toFixed(1) })),
  };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Indexed ${videos.length} clips and ${photos.length} stills → ${MANIFEST}`);
  console.log("Open it and check the shot numbers against social/SHOOT.md before planning.");
  console.log("Set flagged:true on any clip that caught customer branding.");
  process.exit(0);
}

if (!existsSync(MANIFEST)) {
  console.error(`No manifest. Run: node scripts/social/assets.mjs --index`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const have = new Set(manifest.clips.filter((c) => !c.flagged).map((c) => c.shot));
const flagged = manifest.clips.filter((c) => c.flagged).map((c) => c.shot);

const ready = [];
const blocked = [];
for (const entry of BANK) {
  if (entry.source === "generated") continue;
  const missing = (entry.shots || []).filter((s) => !have.has(s));
  (missing.length ? blocked : ready).push({ slug: entry.slug, title: entry.title, missing });
}

console.log(`${manifest.clips.length} clips, ${manifest.stills.length} stills indexed.`);
if (flagged.length) console.log(`Flagged for branding, excluded: shots ${flagged.join(", ")}`);
console.log(`\n${ready.length} pieces can be cut today.`);

if (blocked.length) {
  console.log(`\n${blocked.length} waiting on footage:`);
  for (const b of blocked) console.log(`  ${b.title} — needs shot ${b.missing.join(", ")}`);
  const gaps = [...new Set(blocked.flatMap((b) => b.missing))].sort((a, b) => a - b);
  console.log(`\nMissing shots: ${gaps.join(", ")}. These are the ones worth a second visit for.`);
}
