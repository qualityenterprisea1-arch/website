#!/usr/bin/env node
/* Render the carousels and stills to real images.
 *
 *   node scripts/social/slides.mjs --html three-five-seven-ply   write the HTML only
 *   node scripts/social/slides.mjs --render three-five-seven-ply
 *   node scripts/social/slides.mjs --render all
 *
 * These are typographic spec sheets, so they are laid out in HTML and CSS and
 * photographed by the copy of headless Chrome already sitting on this machine —
 * no npm install, no image model. That is not only cheaper: image models still
 * mangle text, and a carousel whose whole job is to say "3 ply = 2 liners, 1
 * flute" cannot afford a garbled character. Type set by a browser is exact,
 * repeatable, and identical to the site it links to.
 *
 * The result is 1080x1350 (4:5) — the tallest frame Instagram, Facebook and
 * LinkedIn all accept, so one render covers three feeds.
 */

import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { createRequire } from "node:module";
import { BANK, PILLARS, altText } from "./bank.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const OUT = "social/out";
const W = 1080, H = 1350;

/* ------------------------------------------------------------------ chrome */

/* Whatever revision Playwright last downloaded. Resolved by looking rather than
 * by pinning a number, because that number changes every time the MCP updates
 * and a hard-coded path would break silently months from now. */
function chrome() {
  const envPath = process.env.QE_CHROME;
  if (envPath && existsSync(envPath)) return envPath;
  const root = join(homedir(), "AppData", "Local", "ms-playwright");
  if (existsSync(root)) {
    const dirs = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      for (const sub of ["chrome-win64", "chrome-win"]) {
        const exe = join(root, d, sub, "chrome.exe");
        if (existsSync(exe)) return exe;
      }
    }
  }
  for (const p of [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ]) if (existsSync(p)) return p;
  console.error("No Chrome found. Set QE_CHROME to a chrome.exe path.");
  process.exit(1);
}

/* ------------------------------------------------------------------ slides */

/* Cover, one idea per slide, then the ask. Numbering a carousel is honest —
 * the reader genuinely needs to know how many are left — so the counter is real
 * information rather than decoration. */
function slidesFor(entry) {
  const cover = { kind: "cover", text: entry.hook, label: PILLARS[entry.pillar] };
  const body = entry.body.map((t) => ({ kind: "body", text: t }));
  const close = {
    kind: "close",
    text: entry.cta === "visit"
      ? "Road No. 13, Plot 75A, IDA Mallapur, Hyderabad."
      : "Send the size, what goes inside, the weight, and how many a month.",
    sub: entry.cta === "visit" ? "Mon-Sat, 9:30 to 18:30" : "Written quote in 4 working hours. Minimum 500 boxes.",
  };
  return entry.format === "still" ? [{ ...cover, kind: "still", body: entry.body[0], close }] : [cover, ...body, close];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page(entry, slides) {
  const n = slides.length;
  const card = (s, i) => {
    const counter = n > 1 ? `${String(i + 1).padStart(2, "0")}/${String(n).padStart(2, "0")}` : "";
    if (s.kind === "still") return `
      <section class="slide">
        <div class="rail"><span class="eyebrow">${esc(PILLARS[entry.pillar])}</span><span class="eyebrow red">Quality Enterprises</span></div>
        <div class="mid">
          <h1>${esc(s.text)}</h1>
          <p class="lede">${esc(s.body)}</p>
        </div>
        <div class="foot">
          <div class="hr"></div>
          <p class="ask">${esc(s.close.text)}</p>
          <p class="eyebrow">${esc(s.close.sub)} &nbsp;·&nbsp; quality-enterprises.co.in</p>
        </div>
      </section>`;
    if (s.kind === "cover") return `
      <section class="slide">
        <div class="rail"><span class="eyebrow">${esc(s.label)}</span><span class="eyebrow">${counter}</span></div>
        <div class="mid"><h1>${esc(s.text)}</h1><div class="tick"></div></div>
        <div class="foot"><div class="hr"></div><p class="eyebrow">Swipe &nbsp;·&nbsp; quality-enterprises.co.in</p></div>
      </section>`;
    if (s.kind === "close") return `
      <section class="slide close">
        <div class="rail"><span class="eyebrow">${esc(PILLARS[entry.pillar])}</span><span class="eyebrow">${counter}</span></div>
        <div class="mid"><h2 class="ask">${esc(s.text)}</h2><p class="lede">${esc(s.sub)}</p></div>
        <div class="foot"><div class="hr"></div><p class="eyebrow">quality-enterprises.co.in &nbsp;·&nbsp; IDA Mallapur, Hyderabad</p></div>
      </section>`;
    return `
      <section class="slide">
        <div class="rail"><span class="eyebrow">${esc(PILLARS[entry.pillar])}</span><span class="eyebrow">${counter}</span></div>
        <div class="mid"><p class="body">${esc(s.text)}</p></div>
        <div class="foot"><div class="hr"></div><p class="eyebrow">quality-enterprises.co.in</p></div>
      </section>`;
  };

  return `<!doctype html><meta charset="utf-8"><style>
    /* Windows system faces only: these render on the machine that builds them,
       with no network and no webfont that might silently fall back. */
    :root {
      --ground:#F6F3EC; --ink:#16150F; --soft:#5F5A4C; --line:#DCD5C4; --signal:#C4362A;
      --display:"Bahnschrift","Segoe UI Semibold","Segoe UI",Arial,sans-serif;
      --body:"Segoe UI",Arial,sans-serif;
      --mono:"Consolas","Courier New",monospace;
    }
    *{box-sizing:border-box;margin:0}
    body{background:var(--ground);color:var(--ink);font-family:var(--body)}
    .slide{
      width:${W}px;height:${H}px;padding:74px 78px;
      display:flex;flex-direction:column;justify-content:space-between;
      background:var(--ground);
    }
    .slide.close{background:#16150F;color:#F6F3EC}
    .slide.close .eyebrow{color:#9C9585}
    .slide.close .hr{background:#3A362C}
    .slide.close .lede{color:#B7B0A0}
    .rail{display:flex;justify-content:space-between;align-items:baseline}
    .eyebrow{
      font-family:var(--mono);font-size:21px;letter-spacing:.14em;text-transform:uppercase;
      color:var(--soft);font-variant-numeric:tabular-nums;
    }
    .eyebrow.red{color:var(--signal)}
    .mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:34px}
    h1{
      font-family:var(--display);font-weight:700;font-stretch:87.5%;
      font-size:96px;line-height:1.03;letter-spacing:-.015em;text-wrap:balance;
    }
    h2.ask{font-family:var(--display);font-weight:700;font-stretch:87.5%;font-size:74px;line-height:1.08;letter-spacing:-.01em}
    .body{font-size:56px;line-height:1.3;font-weight:400;letter-spacing:-.005em}
    .lede{font-size:34px;line-height:1.4;color:var(--soft)}
    p.ask{font-family:var(--display);font-weight:700;font-stretch:87.5%;font-size:46px;line-height:1.15;margin-bottom:14px}
    .tick{width:132px;height:9px;background:var(--signal)}
    .foot{display:flex;flex-direction:column;gap:22px}
    .hr{height:1px;background:var(--line)}
  </style>${slides.map(card).join("")}`;
}

/* ------------------------------------------------------------------ render */

function render(entry, htmlOnly) {
  const slides = slidesFor(entry);
  const dir = join(OUT, entry.slug);
  mkdirSync(dir, { recursive: true });

  const htmlPath = resolve(dir, "slides.html");
  writeFileSync(htmlPath, page(entry, slides));
  if (htmlOnly) { console.log(`${htmlPath}  (${slides.length} slides — open it to check before rendering)`); return; }

  /* One tall screenshot, then sliced. Chrome start-up dominates the cost, so a
     single shot per piece is several times faster than one per slide. */
  const tall = resolve(dir, ".strip.png");
  execFileSync(chrome(), [
    "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--virtual-time-budget=3000",
    `--window-size=${W},${H * slides.length}`,
    `--screenshot=${tall}`,
    `file:///${htmlPath.replace(/\\/g, "/")}`,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  return Promise.all(slides.map((_, i) =>
    sharp(tall).extract({ left: 0, top: i * H, width: W, height: H })
      .png({ compressionLevel: 9 }).toFile(join(dir, `${String(i + 1).padStart(2, "0")}.png`))
  )).then(() => {
    rmSync(tall, { force: true });
    console.log(`${dir}  ${slides.length} slides`);
    console.log(`   alt text: ${altText(entry)}`);
  });
}

/* --------------------------------------------------------------------- cli */

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? (argv[i + 1] ?? true) : null; };

/* The five diagram posts are drawn by Higgsfield, not typeset here — a slide
   whose job is to show four flute profiles cannot do it in words. Everything
   else is typography, and typography set by a browser is exact. */
const posts = BANK.filter((b) => b.kind === "post" && b.hf !== "image");
const target = flag("render") || flag("html");
const htmlOnly = !!flag("html");

if (target === true || target === "all") {
  for (const p of posts) await render(p, htmlOnly);
} else if (target) {
  const p = posts.find((x) => x.slug === target);
  if (!p) { console.error(`No post called ${target}`); process.exit(1); }
  await render(p, htmlOnly);
} else {
  console.log(`${posts.length} posts to render:\n`);
  for (const p of posts) console.log(`  ${p.format.padEnd(9)} ${String(slidesFor(p).length).padStart(2)} slides  ${p.title}`);
  console.log(`\n  node scripts/social/slides.mjs --render all`);
}
