# Quality Enterprises image set

This folder is the image-generation brief and source inventory for the website.

## Required assets

- `catalog-shipping-board`: wide six-panel catalogue reference for the shipping range.
- `catalog-specialty-board`: wide six-panel catalogue reference for specialty formats.
- 20 individual product images, one per catalogue route:
  - kraft shipping boxes
  - white shipping boxes
  - double wall boxes
  - triple wall boxes
  - cube boxes
  - telescoping boxes
  - flat boxes
  - multi-depth boxes
  - tab-locking mailer boxes
  - indestructo mailers
  - easy fold mailers
  - reverse tuck corrugated boxes
  - SBS and cardboard boxes
  - chipboard cartons
  - chipboard boxes
  - pizza boxes
  - file storage boxes
  - corrugated bins
  - corrugated trays
  - corrugated tubes

Colour shipping boxes are intentionally excluded from the product range.

## Shared generation prompt

Use case: product-mockup
Asset type: B2B corrugated packaging catalogue product image
Scene/backdrop: clean warm-white studio sweep, no environment clutter
Style/medium: high-end photorealistic product photography with physically accurate corrugated paper construction
Composition/framing: single product or small matching set, three-quarter view, centered with generous whitespace, square crop
Lighting/mood: soft large-source studio light, subtle grounded shadow, neutral and professional
Color palette: natural kraft brown, clean white, charcoal ink only where specified
Materials/textures: visible paper grain, crisp folds, believable board thickness, clean die-cut edges
Text (verbatim): none
Constraints: no logo, no brand name, no labels, no barcode, no watermark, no people, no food, no colored shipping boxes, no collage, no floating objects
Avoid: toy-like 3D render, glossy plastic, excessive perspective, fake text, low-detail edges, duplicate products

## Product-specific prompts

For each prompt below, append the shared generation prompt and replace the subject line.

1. `kraft-shipping-boxes`: Subject: a compact group of open and closed brown kraft regular-slotted shipping cartons, one carton slightly angled to show corrugated edge.
2. `white-shipping-boxes`: Subject: clean white-faced corrugated shipping cartons, one closed and one open, kraft board visible only at the edge.
3. `double-wall-boxes`: Subject: two heavy-duty brown double-wall cartons, one closed and one open, visibly thicker board and reinforced seams.
4. `triple-wall-boxes`: Subject: one large industrial triple-wall carton with open flaps beside a closed carton, substantial board thickness and rugged construction.
5. `cube-boxes`: Subject: a precise cube-shaped kraft corrugated carton, one closed and one open, balanced proportions.
6. `telescoping-boxes`: Subject: a two-piece telescoping corrugated carton with long rectangular base and sliding lid separated slightly to show the fit.
7. `flat-boxes`: Subject: low-profile flat corrugated cartons stacked neatly, one open to show shallow depth.
8. `multi-depth-boxes`: Subject: one multi-depth corrugated carton shown at two crease heights, with clean stepped score lines.
9. `tab-locking-mailer-boxes`: Subject: a self-locking corrugated mailer with tab closure visible, one closed and one open.
10. `indestructo-mailers`: Subject: reinforced corrugated mailer with double side walls and protective folded edges, closed and open pair.
11. `easy-fold-mailers`: Subject: an easy-fold corrugated mailer blank partly folded into a finished carton, crisp fold lines.
12. `reverse-tuck-corrugated-boxes`: Subject: a reverse-tuck corrugated carton, one flat blank and one assembled box with tuck flaps visible.
13. `sbs-cardboard-boxes`: Subject: neat white SBS/cardboard folding cartons, one assembled and one flat, lighter board than corrugated shipping cartons.
14. `chipboard-cartons`: Subject: rigid chipboard cartons for components, one assembled and two flat die-cut blanks, natural board tones.
15. `chipboard-boxes`: Subject: small lightweight chipboard boxes with clean folds, one closed and one open.
16. `pizza-boxes`: Subject: stackable plain kraft corrugated pizza boxes, one closed and one open, no food and no printed branding.
17. `file-storage-boxes`: Subject: stackable corrugated archive file boxes with lift-off lids, one open and one closed, no readable labels.
18. `corrugated-bins`: Subject: open-top corrugated handling bins in two practical sizes, reinforced rim and clean kraft board.
19. `corrugated-trays`: Subject: shallow corrugated presentation and handling trays, nested pair with clean folded corners.
20. `corrugated-tubes`: Subject: long rectangular corrugated protective tubes and sleeves in kraft and white, aligned parallel.

## Quality and delivery target

Generate square masters at the highest available quality. Keep the product centered and isolated so Next Image can crop it consistently. Export a lossless master for archive and an AVIF/WebP web derivative. Do not upscale the existing 172px crops; they are references only.

## Generated/optimized paths in this repository

- Product web assets: `public/images/products/`
- Catalogue-board web assets: `public/images/catalog/`
- Original supplied/cropped PNG references: `images/source/`

The website currently uses the AVIF derivatives. WebP siblings are retained for fallback or future `<picture>` usage.
