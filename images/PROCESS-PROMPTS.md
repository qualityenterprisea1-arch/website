# Image generation brief — process, hero and factory

Two sets to generate:

- **A. Hero** (1 image) — replaces the current catalogue product shot in the hero.
- **B. Process** (9 images) — one per stage on `/process`, which currently has no imagery.

Everything below is written to be pasted directly into an image model
(gpt-image-2, Midjourney, Flux, Nano Banana Pro). Generate at the **highest
resolution available**, then convert to AVIF + WebP and drop into
`public/images/process/` using the filenames given.

---

## SHARED ART DIRECTION — prepend or keep consistent across every image

> Cinematic industrial photography of a corrugated packaging factory. Shot on a
> full-frame camera with a 35mm or 50mm prime, shallow-to-medium depth of field,
> natural directional light with warm highlights and soft falloff into shadow.
> Colour palette limited to kraft brown, warm cream, bone grey and deep charcoal
> — no saturated colours, no blue-white LED cast. Fine paper dust in the light
> beams. Real machine surfaces: brushed steel, worn paint, rubber rollers.
> Photorealistic, editorial, calm and premium — like a Monocle or Kinfolk factory
> feature, not a stock photo. No people's faces, no visible brand names, no logos,
> no text overlays, no watermarks, no cartoon or 3D-render look.

**Aspect ratio:** 3:2 landscape for all process images. 4:5 portrait for the hero.

**Consistency trick:** generate the hero first, then pass it as a style reference
for the nine process shots so the grade matches across the set.

---

## A. HERO — `public/images/hero/factory-hero.avif`

The current hero uses a catalogue product shot, which is why it reads as stock.
This replaces it with something with depth and atmosphere.

> A single stack of freshly made kraft corrugated cartons in the foreground of a
> working board factory, shot slightly from below at eye level. Strong warm side
> light rakes across the flutes so the corrugation catches the light along the cut
> edge. The factory recedes into soft focus behind — the dark silhouette of a
> corrugator line, faint haze, warm overhead lamps as bokeh. Deep charcoal shadow
> occupies the upper third of the frame so headline text can sit over it. The
> cartons are unprinted, plain kraft, crisp and new. Portrait 4:5 composition with
> the stack weighted to the right two-thirds, negative space on the left.
> Photorealistic, cinematic, premium.

*Note: if you want the headline to sit over the image rather than beside it, ask
for "generous dark negative space across the left half" instead.*

---

## B. PROCESS — nine stages

Filenames match the stage order on `/process`.

### 01 — Corrugation → `01-corrugation.avif`
> Close-up of the corrugating roller on a board line: a continuous sheet of kraft
> paper being pressed into fluted waves between two heated steel rollers, then
> bonded to a flat liner. Steam and warmth rising off the sheet. The flute profile
> is sharp and clearly visible in raking side light. Machine steel is worn and
> oiled, not new. Shallow depth of field on the flute, factory falling into warm
> shadow behind.

### 02 — Cutting → `02-cutting.avif`
> A wide corrugated board sheet passing through a rotary sheet cutter, with a
> clean cut edge and a neat stack of squared blanks building on the delivery table
> beside it. The exposed cut edge shows the flute sandwich in cross-section.
> Overhead light, precise and clean, kraft brown against grey steel.

### 03 — Printing → `03-printing.avif`
> A flexographic printing unit on a corrugated line — rubber printing plate
> mounted on the cylinder, ink roller glistening, a printed kraft sheet emerging
> below with a simple unbranded handling mark on it. Ink is a single dark colour,
> no logos or readable brand names. Mechanical, tactile, warm light on the rubber
> and steel.

### 04 — Pasting → `04-pasting.avif`
> Close-up of the glue application on a folder-gluer: a thin bead of adhesive
> being laid along the manufacturer's joint flap of a corrugated blank, with the
> panel folding over under pressure. Motion just perceptible in the folding panel.
> Adhesive catches the light. Tight framing, shallow depth of field.

### 05 — Scoring → `05-scoring.avif`
> Detail of scoring wheels creasing a corrugated sheet — the crease line pressed
> cleanly into the board without crushing the surrounding flute. Show the sheet at
> an angle so the fresh score line runs diagonally through frame and catches a
> highlight. Steel wheel, kraft board, warm rim light.

### 06 — Slotting → `06-slotting.avif`
> Slotting knives cutting the flap slots into a corrugated blank, with small
> offcuts of board falling away. The four flaps of the finished carton are just
> beginning to be defined. Sharp steel blades, kraft dust in the air, directional
> light from the left.

### 07 — Punching → `07-punching.avif`
> A wooden die-cutting forme with curved steel cutting rule pressing a hand-hole
> and ventilation cut-out into a corrugated blank, with the waste pieces releasing
> cleanly. Show the die itself — plywood base, steel rules, rubber ejection
> pads — half in shadow. Craft and precision.

### 08 — Stitching → `08-stitching.avif`
> A wire stitching head driving flat steel staples through the joint of a heavy
> triple-wall corrugated carton, with a row of neat completed stitches running
> along the seam. Heavy-duty and industrial. Tight crop on the seam, warm metallic
> highlights, deep shadow behind.

### 09 — Waste management → `09-waste.avif`
> Neatly separated corrugated offcuts and trim collected in a baling area, with a
> compressed bale of kraft board waste stacked and strapped, ready for recycling.
> Orderly, clean and deliberate — not a rubbish heap. Warm daylight from a high
> factory window, dust in the beam.

---

## After generating

1. Inspect each one. Reject any with faces, readable brand names, or a 3D-render look.
2. Convert: `ffmpeg -i in.png -c:v libaom-av1 -crf 30 -still-picture 1 out.avif`
   (or any AVIF encoder). Keep the lossless PNG masters under `images/generated-masters/`.
3. Put web files in `public/images/process/` with the filenames above.
4. Tell the agent they are in place — `/process` needs the `<Image>` slots wired
   in, and the hero needs its `src` pointed at the new file.

## Rules that must hold

- No fabricated brand marks. `images/corrugated_catalog_masters/asset-010` is
  excluded from the site for exactly this reason — it carries an invented
  "INDESTRUCTO(R)" trademark.
- No claim the imagery cannot support. These are illustrative process shots, not
  photographs of this specific factory, so they must not be captioned as "our
  machines" or "our line" until real photographs replace them.
