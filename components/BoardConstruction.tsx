"use client";

import { useEffect, useRef } from "react";

const SPEC = [
  { type: "liner", name: "OUTER LINER", spec: "150 GSM VIRGIN KRAFT" },
  { type: "flute", name: "FLUTED MEDIUM", spec: "C-FLUTE · 4.0 MM" },
  { type: "liner", name: "INNER LINER", spec: "150 GSM VIRGIN KRAFT" },
  { type: "flute", name: "FLUTED MEDIUM", spec: "C-FLUTE · 4.0 MM" },
  { type: "liner", name: "MIDDLE LINER", spec: "180 GSM VIRGIN KRAFT" },
  { type: "flute", name: "FLUTED MEDIUM", spec: "B-FLUTE · 3.0 MM" },
  { type: "liner", name: "BASE LINER", spec: "180 GSM VIRGIN KRAFT" },
] as const;

const COPY = [
  ["01 / 05", "The complete board specification", "Every carton is a stack of kraft layers. What you order is decided by what goes in that stack."],
  ["02 / 05", "Three layers. 3 ply.", "Two flat kraft liners bonded either side of one fluted medium. Standard board for light cartons and everyday dispatch."],
  ["03 / 05", "The flute carries the load.", "Liners hold shape. The fluted medium resists crushing when cartons are stacked and moved through a delivery network."],
  ["04 / 05", "Add a flute. 5 ply.", "A second fluted layer increases stacking strength. This is the board for transit, storage and heavier stock."],
  ["05 / 05", "Three flutes. 7 ply.", "Triple wall for machinery and demanding freight. Heavier than most orders need, and we will say so."],
];
const READINGS = [
  ["3 PLY", "Single wall", "6-8 kg/cm²", "10 kg"],
  ["3 PLY", "Single wall", "6-8 kg/cm²", "10 kg"],
  ["3 PLY", "Single wall", "6-8 kg/cm²", "10 kg"],
  ["5 PLY", "Double wall", "10-14 kg/cm²", "25 kg"],
  ["7 PLY", "Triple wall", "16-20 kg/cm²", "50 kg"],
];

const W = 300;
const DX = 196;
const DY = -98;
const X0 = 200;
const YT = 250;
const LINER_THICKNESS = 14;
const FLUTE_HEIGHT = 44;
const PERIOD = 50;
const heightAt = (index: number) => SPEC[index].type === "liner" ? LINER_THICKNESS : FLUTE_HEIGHT;
const layerY = SPEC.reduce<number[]>((positions, _layer, index) => {
  positions.push(index === 0 ? YT : positions[index - 1] + heightAt(index - 1));
  return positions;
}, []);
const totalHeight = (count: number) => layerY.slice(0, count).reduce((sum, _, index) => sum + heightAt(index), 0);
const centerOffset: Record<3 | 5 | 7, number> = { 3: (totalHeight(7) - totalHeight(3)) / 2, 5: (totalHeight(7) - totalHeight(5)) / 2, 7: 0 };

function wave(y: number, amplitude: number, xOffset = 0, yOffset = 0) {
  let path = `M${X0 + xOffset} ${y + yOffset}`;
  for (let x = 0; x < W; x += PERIOD) {
    path += ` Q${X0 + x + PERIOD * 0.25 + xOffset} ${y - amplitude + yOffset} ${X0 + x + PERIOD * 0.5 + xOffset} ${y + yOffset}`;
    path += ` Q${X0 + x + PERIOD * 0.75 + xOffset} ${y + amplitude + yOffset} ${X0 + x + PERIOD + xOffset} ${y + yOffset}`;
  }
  return path;
}

function layerMarkup(index: number) {
  const y = layerY[index];
  if (SPEC[index].type === "liner") return <g className="board-layer" key={`layer-${index}`}><path className="board-hair" d={`M${X0} ${y} L${X0 + W} ${y} L${X0 + W + DX} ${y + DY} L${X0 + DX} ${y + DY} Z`} /><path className="board-hair" d={`M${X0} ${y} L${X0} ${y + LINER_THICKNESS} L${X0 + W} ${y + LINER_THICKNESS} L${X0 + W} ${y}`} /><path className="board-hair" d={`M${X0 + W} ${y + LINER_THICKNESS} L${X0 + W + DX} ${y + LINER_THICKNESS + DY} L${X0 + W + DX} ${y + DY}`} /><path className="board-hair board-faint" d={`M${X0 + DX} ${y + DY} L${X0 + DX} ${y + DY + LINER_THICKNESS} L${X0 + W + DX} ${y + DY + LINER_THICKNESS}`} /></g>;
  const mid = y + FLUTE_HEIGHT / 2;
  const amplitude = (FLUTE_HEIGHT - 10) / 2;
  const points = Array.from({ length: W / (PERIOD / 2) + 1 }, (_, point) => point * PERIOD / 2);
  return <g className="board-layer" key={`layer-${index}`}><path className="board-hair board-hair-strong" d={wave(mid - 2, amplitude)} /><path className="board-hair board-hair-strong" d={wave(mid + 2, amplitude)} /><path className="board-hair board-faint" d={wave(mid - 2, amplitude, DX, DY)} />{points.map((x) => { const angle = (x / PERIOD) * Math.PI * 2; const yPoint = mid - 2 - Math.sin(angle) * amplitude; return <path className="board-hair board-faint" key={x} d={`M${X0 + x} ${yPoint} L${X0 + x + DX} ${yPoint + DY}`} />; })}<path className="board-hair" d={`M${X0} ${mid - 2} L${X0} ${mid + 2}`} /><path className="board-hair" d={`M${X0 + W} ${mid - 2} L${X0 + W} ${mid + 2}`} /></g>;
}

export default function BoardConstruction() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const art = element.querySelector<SVGSVGElement>("[data-board-art]");
    const list = element.querySelector<HTMLOListElement>("[data-board-list]");
    const step = element.querySelector<HTMLElement>("[data-board-step]");
    const heading = element.querySelector<HTMLElement>("[data-board-heading]");
    const paragraph = element.querySelector<HTMLElement>("[data-board-paragraph]");
    const ply = element.querySelector<HTMLElement>("[data-board-ply]");
    const construction = element.querySelector<HTMLElement>("[data-board-construction]");
    const strength = element.querySelector<HTMLElement>("[data-board-strength]");
    const load = element.querySelector<HTMLElement>("[data-board-load]");
    const ticks = [...element.querySelectorAll<HTMLElement>("[data-board-tick]")];
    const layers = [...element.querySelectorAll<SVGGElement>(".board-layer")];
    const callouts = [...element.querySelectorAll<SVGGElement>(".board-callout")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 900px)").matches;
    let observer: { revert?: () => unknown } | undefined;
    let cleanupObserver: (() => void) | undefined;

    const setCopy = (index: number) => {
      const copy = COPY[index];
      const reading = READINGS[index];
      if (step) step.textContent = copy[0];
      if (heading) heading.textContent = copy[1];
      if (paragraph) paragraph.textContent = copy[2];
      if (ply) ply.textContent = reading[0];
      if (construction) construction.textContent = reading[1];
      if (strength) strength.textContent = reading[2];
      if (load) load.textContent = reading[3];
    };
    const staticRender = (staticPly: 3 | 5 | 7) => {
      element.classList.add("board-static");
      setCopy(staticPly === 7 ? 4 : staticPly === 5 ? 3 : 1);
      const middle = (staticPly - 1) / 2;
      layers.forEach((layer, index) => { layer.style.display = index < staticPly ? "" : "none"; if (index < staticPly) layer.setAttribute("transform", `translate(0 ${centerOffset[staticPly] + (index - middle) * 58})`); });
      if (art) art.setAttribute("viewBox", "150 120 640 470");
      if (list) { list.innerHTML = SPEC.slice(0, staticPly).map((item) => `<li class="${item.type === "flute" ? "is-flute" : ""}"><span><i></i><b>${item.name}</b></span><small>${item.spec}</small></li>`).join(""); }
      ticks.forEach((tick, index) => tick.classList.toggle("is-active", index < Math.round(ticks.length * 0.5)));
    };
    if (reduced || !wide) { staticRender(3); return () => undefined; }

    let cancelled = false;
    import("animejs").then(({ createTimeline, onScroll, utils }) => {
      if (cancelled || !art) return;
      const driver = { progress: 0 };
      let lastPly = -1;
      let lastCopy = -1;
      let lastTick = -1;
      let lastHighlight = -1;
      const clamp = (value: number) => Math.min(1, Math.max(0, value));
      const range = (progress: number, start: number, end: number) => clamp((progress - start) / (end - start));
      const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
      const render = (progress: number) => {
        let currentPly: 3 | 5 | 7 = 3;
        let copyBeat = 0;
        let expansion = 0;
        let rotation = 0;
        let scale = 1;
        let highlight = 0;

        if (progress < 0.12) {
          const amount = range(progress, 0, 0.12);
          rotation = mix(-2.5, 0, amount);
          scale = mix(0.88, 1, amount);
        } else if (progress < 0.30) {
          currentPly = 3;
          copyBeat = 1;
          expansion = mix(0, 62, range(progress, 0.12, 0.30));
        } else if (progress < 0.43) {
          currentPly = 3;
          copyBeat = 2;
          expansion = 62;
          scale = mix(1, 1.06, range(progress, 0.30, 0.36));
          highlight = range(progress, 0.30, 0.36);
        } else if (progress < 0.48) {
          currentPly = 3;
          copyBeat = 2;
          expansion = mix(62, 0, range(progress, 0.43, 0.48));
          scale = mix(1.06, 1, range(progress, 0.43, 0.48));
          highlight = mix(1, 0, range(progress, 0.43, 0.48));
        } else if (progress < 0.60) {
          currentPly = 5;
          copyBeat = progress >= 0.57 ? 3 : 2;
          expansion = mix(0, 54, range(progress, 0.48, 0.60));
        } else if (progress < 0.70) {
          currentPly = 5;
          copyBeat = 3;
          expansion = 54;
        } else if (progress < 0.75) {
          currentPly = 5;
          copyBeat = 3;
          expansion = mix(54, 0, range(progress, 0.70, 0.75));
        } else {
          currentPly = 7;
          copyBeat = progress >= 0.90 ? 4 : 3;
          expansion = mix(0, 44, range(progress, 0.75, 0.90));
          scale = mix(1, 0.98, range(progress, 0.75, 0.90));
        }

        if (currentPly !== lastPly) { lastPly = currentPly; layers.forEach((layer, index) => { layer.style.display = index < currentPly ? "" : "none"; }); }
        if (copyBeat !== lastCopy) { lastCopy = copyBeat; setCopy(copyBeat); }
        utils.set(art, { rotate: rotation, scale });
        const middle = (currentPly - 1) / 2;
        for (let index = 0; index < currentPly; index += 1) utils.set(layers[index], { translateY: centerOffset[currentPly] + (index - middle) * expansion });
        if ((highlight > 0.5) !== (lastHighlight > 0.5)) { lastHighlight = highlight; layers.forEach((layer, index) => { if (SPEC[index].type === "flute") { layer.classList.toggle("is-on", highlight > 0.5); callouts[index]?.classList.toggle("is-on", highlight > 0.5); } }); }
        for (let index = 0; index < currentPly; index += 1) if (SPEC[index].type === "liner") utils.set(layers[index], { opacity: 1 - highlight * 0.7 });
        const labelYs = Array.from({ length: currentPly }, (_, index) => 170 + (560 - 170) * (index / (currentPly - 1)));
        const middleLabel = (currentPly - 1) / 2;
        callouts.forEach((callout, index) => {
          if (index >= currentPly) { callout.style.opacity = "0"; return; }
          const y = layerY[index] + heightAt(index) / 2 + centerOffset[currentPly] + (index - middleLabel) * expansion + DY;
          const labelY = labelYs[index];
          callout.querySelector("path")?.setAttribute("d", `M${X0 + W + DX} ${y} L${X0 + W + DX + 70} ${labelY} L864 ${labelY}`);
          callout.querySelector("circle")?.setAttribute("cx", String(X0 + W + DX));
          callout.querySelector("circle")?.setAttribute("cy", String(y));
          callout.querySelector("text:first-of-type")?.setAttribute("y", String(labelY - 2));
          callout.querySelector("text:last-of-type")?.setAttribute("y", String(labelY + 13));
          const reveal = clamp((expansion - 14) / 34);
          callout.style.opacity = SPEC[index].type === "flute" ? String(reveal) : String(reveal * (1 - highlight * 0.75));
        });
        const tickIndex = Math.round(progress * (ticks.length - 1));
        if (tickIndex !== lastTick) { if (lastTick >= 0) ticks[lastTick]?.classList.remove("is-active"); ticks[tickIndex]?.classList.add("is-active"); lastTick = tickIndex; }
      };
      const timeline = createTimeline({ autoplay: false, defaults: { ease: "linear" }, onUpdate: (self) => render(self.progress || 0) });
      timeline.add(driver, { progress: [0, 1], duration: 5000 }, 0);
      observer = onScroll({ target: element, axis: "y", enter: "top top", leave: "bottom bottom", sync: 0.13 }).link(timeline);
      cleanupObserver = () => observer?.revert?.();
      render(0);
    }).catch(() => staticRender(3));
    return () => { cancelled = true; cleanupObserver?.(); };
  }, []);

  return <section ref={root} className="board-section"><div className="board-rig"><div className="board-stage"><div className="board-heading"><span className="board-step" data-board-step>01 / 05</span><h2 data-board-heading>The complete board specification</h2><p data-board-paragraph>Every carton is a stack of kraft layers. What you order is decided by what goes in that stack.</p></div><svg data-board-art viewBox="0 0 1100 720" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="board-art-title"><title id="board-art-title">Exploded wireframe of corrugated board showing kraft liners and fluted medium.</title>{[6, 5, 4, 3, 2, 1, 0].map((index) => layerMarkup(index))}{SPEC.map((item, index) => <g className="board-callout" key={`callout-${index}`}><path className="board-leader" d="" /><circle className="board-dot" r="2.2" cx="0" cy="0" /><text className="board-label" x="880" y="0">{item.name}</text><text className="board-sub-label" x="880" y="0">{item.spec}</text></g>)}</svg><ol data-board-list className="board-mobile-list" /><div className="board-instrument"><div className="board-instrument-top"><span>Board specification</span><b data-board-ply>3 PLY</b></div><div className="board-instrument-rows"><div><span>Construction</span><span data-board-construction>Single wall</span></div><div><span>Bursting strength</span><span data-board-strength>6-8 kg/cm²</span></div><div><span>Load capacity</span><span data-board-load>10 kg</span></div><div><span>Minimum order</span><span>500 boxes</span></div></div><div className="board-ruler">{Array.from({ length: 22 }, (_, index) => <i data-board-tick key={index} />)}</div></div></div></div></section>;
}
