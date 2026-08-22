/* The subject bank — a quarter of content, planned before the first post.
 *
 * Twelve weeks, four pieces a week: two videos and two posts, in that rhythm.
 * Planning ahead rather than weekly is not tidiness. A channel that decides its
 * subject on the day drifts to whatever is easy to make, which is always the
 * thing that flatters the factory and teaches the buyer nothing.
 *
 * Three rules are enforced here rather than left to whoever is posting:
 *
 *   1. Every claim is either a fact about how corrugated board behaves, or a
 *      commitment the site already makes (500 MOQ, a written quote in four
 *      working hours, the nine conversion stages). No certifications, no
 *      tonnage, no client names, no years in business. Same rule as the site.
 *   2. Captions are composed from these parts, not written by a model at post
 *      time. An unattended model writing marketing copy about a factory is how
 *      an invented ISO number ends up on the internet under your name.
 *   3. Every piece names the shots it needs from social/SHOOT.md. A piece whose
 *      footage does not exist stays queued instead of quietly becoming an AI
 *      video of somebody else's factory.
 *
 * `source` is the honest label: `footage` is your floor, `generated` is a
 * diagram or motion graphic that depicts nothing it claims to have filmed, and
 * `mixed` is your stills with type over them. Nothing generated is ever
 * captioned as though it were shot at Plot 75A.
 */

export const PILLARS = {
  B: "How a box works",   // the mechanics — why board does what it does
  F: "Format file",       // which box for which job
  S: "Spec school",       // how to buy without getting it wrong
  R: "The real thing",    // the floor, running
};

/* Kept short on purpose. Thirty hashtags is a 2019 tactic that now reads as a
 * page nobody is home at. These are the tags a Hyderabad purchase manager or a
 * packaging person would actually follow. */
export const BASE_TAGS = [
  "corrugatedboxes", "packaging", "hyderabad", "manufacturing", "msme",
];

export const CTAS = {
  quote: (link) =>
    `Send the size, what goes inside, the weight and how many a month. Written quote in 4 working hours.\n${link}`,
  whatsapp: (link) =>
    `WhatsApp the size and we will price it — the message is already written, just fill the blanks.\n${link}`,
  ask: (link) =>
    `Tell us what you ship and we will tell you which board holds it. No minimum to ask.\n${link}`,
  sample: (link) =>
    `Ask for a sample before the bulk order. Minimum is 500 boxes, not 5,000.\n${link}`,
  visit: (link) =>
    `Road No. 13, Plot 75A, IDA Mallapur. Mon-Sat, 9:30 to 18:30.\n${link}`,
};

/* --------------------------------------------------------------- the bank */

export const BANK = [
  /* ---- week 1 ---------------------------------------------------------- */
  {
    slug: "flute-is-the-strength", pillar: "B", kind: "video", format: "reel",
    title: "What actually makes a box strong",
    hook: "The brown paper is not the strength. This wave is.",
    body: [
      "Flat paper carries almost nothing. Bend it into a wave, glue a liner to each side, and the wave becomes a row of tiny columns standing on end.",
      "That is the whole trick. A 3 ply box is two flat liners with one wave between them.",
      "Which is why a crushed box is usually a box whose flutes were flattened before it was ever loaded.",
    ],
    cta: "ask", shots: [4, 5, 10], source: "footage",
  },
  {
    slug: "three-five-seven-ply", pillar: "B", kind: "post", format: "carousel",
    title: "3 ply, 5 ply, 7 ply — which one you actually need",
    hook: "Most people order 5 ply because it sounds safer. Often it is money on the floor.",
    body: [
      "3 ply: two liners, one flute. Light goods, short journeys, one box on top of another.",
      "5 ply: three liners, two flutes. Heavier contents, longer transit, stacked several high.",
      "7 ply: four liners, three flutes. Heavy or long-haul, or where the stack is going up high.",
      "The honest version: tell us the weight and the journey. If lighter board holds it, we will say so.",
    ],
    cta: "ask", shots: [10], source: "mixed",
  },
  {
    slug: "blank-to-box", pillar: "R", kind: "video", format: "reel",
    title: "Flat blank to finished box in eight seconds",
    hook: "Flat sheet. Eight seconds. Box.",
    body: [
      "One blank, one pair of hands, no cuts in the edit.",
      "Every box we ship leaves flat and arrives flat. It becomes a box where you pack it, which is the entire reason a slotted carton is shaped the way it is.",
    ],
    cta: "quote", shots: [20], source: "footage",
  },
  {
    slug: "quote-in-four-hours", pillar: "S", kind: "post", format: "still",
    title: "A written quote in four working hours",
    hook: "Four working hours. In writing. Not a callback.",
    body: [
      "Send four things and the clock starts: internal size, what goes inside, weight per box, quantity per month.",
      "Printing yes or no if you know. If you do not, say so and we will quote both.",
      "A written quote is checkable. A number said on the phone is not.",
    ],
    cta: "quote", shots: [21], source: "mixed",
  },

  /* ---- week 2 ---------------------------------------------------------- */
  {
    slug: "ink-hitting-board", pillar: "R", kind: "video", format: "reel",
    title: "Ink hitting board",
    hook: "Colour meeting kraft, at actual speed.",
    body: [
      "Print goes on before the box exists — on the flat sheet, while it is still easy to hold flat and register.",
      "Which is why artwork changes are cheap on Monday and expensive once the run has started.",
    ],
    cta: "quote", shots: [12, 13], source: "footage",
  },
  {
    slug: "why-cartons-arrive-crushed", pillar: "B", kind: "post", format: "carousel",
    title: "Four reasons your cartons arrive crushed",
    hook: "It is almost never the paper.",
    body: [
      "1. The box was under-filled. Contents carry load too — an empty gap is where the top caves in.",
      "2. The stack overhung the pallet. A box supported only at the edges loses most of its stacking strength.",
      "3. It got damp. Board that has sat on a wet floor is weaker before it is ever loaded.",
      "4. The flutes ran the wrong way. Standing flutes carry the weight; flutes lying flat do not.",
    ],
    cta: "ask", shots: [19, 21], source: "mixed",
  },
  {
    slug: "the-die-coming-down", pillar: "R", kind: "video", format: "reel",
    title: "The die coming down",
    hook: "Watch this at half speed.",
    body: [
      "A die is a shaped blade set into plywood. It cuts and creases a whole blank in one stroke.",
      "That is how a mailer box, a hand-hole or an odd shape gets made repeatably instead of by hand.",
    ],
    cta: "ask", shots: [17], source: "footage",
  },
  {
    slug: "mailer-vs-carton", pillar: "F", kind: "post", format: "still",
    title: "The mailer box, and when it beats a carton",
    hook: "One piece, no tape, opens like a book.",
    body: [
      "A die-cut mailer folds from a single blank and locks shut. No stitching, no tape across the face.",
      "Better when the customer opens it: nothing to cut through, and the printed inside is the first thing they see.",
      "Worse when it is heavy. Past a few kilos a slotted carton with a proper joint is the stronger buy.",
    ],
    cta: "ask", shots: [17], source: "mixed",
  },

  /* ---- week 3 ---------------------------------------------------------- */
  {
    slug: "one-box-three-heights", pillar: "F", kind: "video", format: "reel",
    title: "One box, three heights",
    hook: "Same box. Three heights. One tooling.",
    body: [
      "Extra crease lines let the same blank be folded down to a shorter box.",
      "Useful when one SKU ships in three volumes and you do not want three cartons in the store room.",
    ],
    cta: "ask", shots: [15, 16], source: "footage",
  },
  {
    slug: "what-gsm-tells-you", pillar: "S", kind: "post", format: "carousel",
    title: "What GSM actually tells you",
    hook: "GSM is a weight, not a strength.",
    body: [
      "GSM is grams per square metre of the paper. Heavier paper usually means stronger board — usually.",
      "It says nothing about how the board was made, how the flutes held, or whether it got damp on the way.",
      "The number to ask for is the bursting strength of the finished board, and to ask for it in writing.",
      "Anyone who will not put it in writing is telling you something.",
    ],
    cta: "ask", shots: [1], source: "mixed",
  },
  {
    slug: "inside-ida-mallapur", pillar: "R", kind: "video", format: "reel",
    title: "Twenty seconds inside IDA Mallapur",
    hook: "No music. Just the floor.",
    body: [
      "Reels in, board out, in the order it actually happens.",
      "If you buy cartons in Hyderabad, this is a twenty-minute drive from most of the industrial estates we deliver to.",
    ],
    cta: "visit", shots: [1, 4, 9, 12, 17, 19, 21], source: "footage",
  },
  {
    slug: "why-minimum-500", pillar: "S", kind: "post", format: "still",
    title: "Why the minimum is 500 and not 5,000",
    hook: "500 boxes. That is the floor.",
    body: [
      "Setting up a run costs the same whether it makes 500 boxes or 50,000 — the die, the print setup, the make-ready.",
      "Most plants push the minimum high to spread that cost. We would rather quote 500 and have you come back.",
      "It also means you can test a box on a real dispatch before committing a year of stock to it.",
    ],
    cta: "sample", shots: [21], source: "mixed",
  },

  /* ---- week 4 ---------------------------------------------------------- */
  {
    slug: "the-stack-test", pillar: "B", kind: "video", format: "reel",
    title: "The stack test",
    hook: "The bottom box carries everything above it.",
    body: [
      "Stacking strength is not one box's problem. It is the bottom box in the column, holding the whole load, for the whole journey.",
      "It falls fastest with damp, with time under load, and with any box that is not square on the one below it.",
    ],
    cta: "ask", shots: [21], source: "footage",
  },
  {
    slug: "five-questions-before-you-order", pillar: "S", kind: "post", format: "carousel",
    title: "Five questions to ask any box supplier before you order",
    hook: "Ask these five. The answers sort the field fast.",
    body: [
      "1. What is the bursting strength of the board you are quoting, in writing?",
      "2. Are those internal or external dimensions?",
      "3. What is the minimum order, and what does it cost to reorder?",
      "4. Can I have a sample before the bulk run?",
      "5. What happens if the fit is wrong on the first delivery?",
    ],
    cta: "quote", shots: [], source: "generated",
    gen: "Clean industrial spec-sheet motion graphic. Cream paper background, hairline rules, dark ink monospace labels. Five numbered questions revealing one at a time with a precise mechanical wipe. No people, no factory, no photography. Signal-red numerals. 4:5 aspect.",
  },
  {
    slug: "loading-out", pillar: "R", kind: "video", format: "reel",
    title: "Loading out",
    hook: "Bundles going out at the end of a run.",
    body: [
      "Flat, strapped, counted. This is what a delivery looks like before it becomes a problem or does not.",
      "We deliver across Hyderabad and the Telangana industrial belt.",
    ],
    cta: "visit", shots: [22, 21], source: "footage",
  },
  {
    slug: "send-us-the-size", pillar: "S", kind: "post", format: "still",
    title: "Send us the size",
    hook: "Four lines is a quote. Anything less is a conversation.",
    body: [
      "Internal size, L x W x H.",
      "What goes inside, and what it weighs.",
      "How many a month.",
      "Printing: yes or no.",
    ],
    cta: "whatsapp", shots: [], source: "generated",
    gen: "Static spec-sheet card. Cream background, thin dark rules, monospace field labels with empty ruled lines beside them, as though a form waiting to be filled. Signal-red accent on one label. No photography. 4:5.",
  },

  /* ---- week 5 ---------------------------------------------------------- */
  {
    slug: "flute-direction", pillar: "B", kind: "video", format: "reel",
    title: "Which way the flutes run, and why it decides everything",
    hook: "Turn the board 90 degrees and it loses most of its strength.",
    body: [
      "Flutes are columns. Standing up, they carry a stack. Lying down, they fold.",
      "In a finished box the flutes run top to bottom. That is not a preference, it is the reason the box stands up at all.",
      "Look at the cut edge of any carton you have. You can see which way they run.",
    ],
    cta: "ask", shots: [10, 5], source: "footage",
  },
  {
    slug: "rsc-the-default-box", pillar: "F", kind: "post", format: "carousel",
    title: "The RSC — the box you have seen ten thousand times",
    hook: "If someone says 'a normal carton', they mean this one.",
    body: [
      "Regular Slotted Container. All four flaps the same length, outer flaps meeting in the middle.",
      "It is the default because it wastes the least board of any format — the blank is a plain rectangle.",
      "It stops being the right answer when the contents are heavy enough that a meeting joint is not enough, or when the box is much wider than it is deep.",
    ],
    cta: "ask", shots: [16, 20], source: "mixed",
  },
  {
    slug: "the-waste-skeleton", pillar: "R", kind: "video", format: "reel",
    title: "The part of the board that never becomes a box",
    hook: "This is the offcut, lifted out in one piece.",
    body: [
      "After die-cutting, the waste comes away as a single skeleton. It goes back for recycling, not into the bin.",
      "Nobody outside the trade knows this step exists, and it is a stage you are paying for on every die-cut job.",
    ],
    cta: "ask", shots: [18], source: "footage",
  },
  {
    slug: "internal-vs-external", pillar: "S", kind: "post", format: "still",
    title: "Internal or external — the question that causes the rework",
    hook: "A 300mm box is not a 300mm box.",
    body: [
      "Board has thickness. On 5 ply that is a few millimetres per wall, and it comes off the inside.",
      "Quote against internal dimensions and the contents fit. Quote against external and they may not.",
      "When you send a size, say which one it is. If you do not know, send the size of what goes inside instead.",
    ],
    cta: "quote", shots: [], source: "generated", hf: "image",
    gen: "Technical drawing, 4:5, cream #F6F3EC ground, thin dark #16150F linework, flat vector style. Cross-section through a corrugated box wall showing liner, flute, liner, with the wall thickness clearly exaggerated. Two dimension lines with arrowheads: an outer one spanning the full width and an inner one spanning only the cavity, offset so the difference is obvious. Signal-red #C4362A on the inner line. Monospace labels, text must render exactly: EXTERNAL, INTERNAL. No photography, no 3D, no shading, no extra text.",
  },

  /* ---- week 6 ---------------------------------------------------------- */
  {
    slug: "corner-fails-first", pillar: "B", kind: "video", format: "reel",
    title: "A box fails at the corner first",
    hook: "Not the middle of the panel. The corner.",
    body: [
      "The vertical corners carry most of the compressive load. The flat panels carry surprisingly little.",
      "Which is why a dent in a corner matters far more than a scuff in the middle, and why the joint down that corner is worth paying attention to.",
    ],
    cta: "ask", shots: [19, 20], source: "footage",
  },
  {
    slug: "flute-types-abce", pillar: "B", kind: "post", format: "carousel",
    title: "A, B, C, E — what the flute letters mean",
    hook: "The letters are not sizes in order. A is bigger than C.",
    body: [
      "A flute: the tallest common flute. Most cushioning, most stacking strength, thickest board.",
      "C flute: slightly shorter than A. The general-purpose shipping flute.",
      "B flute: shorter again. Flatter, better print surface, better for boxes that get punched or die-cut.",
      "E flute: much finer. Thin, smooth, prints well — retail boxes rather than shippers.",
      "Combine two in a 5 ply and you get the properties of both.",
    ],
    cta: "ask", shots: [], source: "generated", hf: "image",
    gen: "Technical diagram, 4:5, cream #F6F3EC ground, thin dark #16150F linework, flat vector style. Four corrugated fluting profiles shown in cross-section, side by side, at true relative heights: tallest on the left down to finest on the right. Each sits between two straight liner lines. Signal-red #C4362A height bracket beside each. Monospace labels beneath, text must render exactly: A FLUTE, C FLUTE, B FLUTE, E FLUTE. No photography, no 3D, no shading, no extra text.",
  },
  {
    slug: "machine-sound-only", pillar: "R", kind: "video", format: "reel",
    title: "Thirty seconds, no music",
    hook: "Sound on. That is the corrugator.",
    body: [
      "No music, no voiceover. Just what the room sounds like when board is being made.",
      "Mon to Sat, 9:30 to 18:30, Road No. 13, IDA Mallapur.",
    ],
    cta: "visit", shots: [4, 9, 19], source: "footage",
  },
  {
    slug: "measure-a-box", pillar: "S", kind: "post", format: "still",
    title: "How to measure a box so nobody has to ask twice",
    hook: "Length, width, height. In that order, always.",
    body: [
      "Look down into the open box. The longer side of the opening is the length, the shorter is the width.",
      "Height is the depth from the opening down to the base.",
      "Written L x W x H, in millimetres, internal. That is a spec anyone in the trade reads the same way.",
    ],
    cta: "quote", shots: [], source: "generated", hf: "image",
    gen: "Technical illustration, 4:5, cream #F6F3EC ground, thin dark #16150F linework, flat vector isometric style. An open-topped corrugated box drawn in isometric projection with its flaps open. Three dimension arrows with arrowheads run along three different edges. Monospace labels beside each, text must render exactly: LENGTH, WIDTH, HEIGHT. Signal-red #C4362A on the HEIGHT arrow only. No photography, no 3D rendering, no shading, no extra text.",
  },

  /* ---- week 7 ---------------------------------------------------------- */
  {
    slug: "glue-or-stitch", pillar: "B", kind: "video", format: "reel",
    title: "Glued joint or stitched joint",
    hook: "Two ways to close the seam. They fail differently.",
    body: [
      "Stitched: wire staples through the overlap. Very strong in shear, holds heavy contents, and survives damp better.",
      "Glued: a clean flat seam, nothing to catch, nothing to rust. Better for anything going to a retail shelf or holding food-contact packaging.",
      "Neither is better in general. It depends on the weight and where the box ends up.",
    ],
    cta: "ask", shots: [19, 6], source: "footage",
  },
  {
    slug: "full-overlap-for-heavy", pillar: "F", kind: "post", format: "carousel",
    title: "When the flaps should overlap all the way",
    hook: "If the contents are heavy, the flaps meeting in the middle is not enough.",
    body: [
      "In a full overlap box the outer flaps run the whole width and lie on top of each other.",
      "That gives a double thickness across the whole top and bottom — which is where a heavy box is punished.",
      "It uses more board, so it costs more. Worth it for dense goods; wasted on light ones.",
    ],
    cta: "ask", shots: [16, 20], source: "mixed",
  },
  {
    slug: "reels-arriving", pillar: "R", kind: "video", format: "reel",
    title: "Where a box starts",
    hook: "Before it is a box it is a roll of paper this big.",
    body: [
      "Kraft reels, waiting. Everything downstream is decided here — the paper that goes in sets the strength that comes out.",
      "Ask any supplier what paper they are quoting on. It is a fair question and the answer should be specific.",
    ],
    cta: "ask", shots: [1, 2, 3], source: "footage",
  },
  {
    slug: "sample-before-bulk", pillar: "S", kind: "post", format: "still",
    title: "Ask for a sample. Then pack it and drop it.",
    hook: "A sample you only look at has told you nothing.",
    body: [
      "Put the actual contents in. Close it the way your line closes it. Then handle it the way a transporter will.",
      "Stack something on it overnight. Most fit problems and most strength problems show up in that one night.",
      "Minimum here is 500 boxes, so a first order can itself be the test.",
    ],
    cta: "sample", shots: [20], source: "mixed",
  },

  /* ---- week 8 ---------------------------------------------------------- */
  {
    slug: "monsoon-and-board", pillar: "B", kind: "video", format: "reel",
    title: "What the monsoon does to a carton",
    hook: "Board loses strength long before it looks wet.",
    body: [
      "Corrugated board is paper and starch. Both take up moisture from the air, and the flutes soften as they do.",
      "A box stored against a damp wall or on a wet floor can be substantially weaker by the time it is packed, with nothing visible to show it.",
      "Keep stock off the floor and away from the walls. It is the cheapest strength you will ever buy.",
    ],
    cta: "ask", shots: [21, 10], source: "footage",
  },
  {
    slug: "partitions-and-inserts", pillar: "F", kind: "post", format: "carousel",
    title: "Partitions, and what they are actually for",
    hook: "The divider is not padding. It is structure.",
    body: [
      "A partition stops contents striking each other, which is what breaks bottles and vials in transit.",
      "It also carries load. A gridded insert turns the empty air in a box into vertical support for the stack above.",
      "Sold by cell count and board grade. Tell us what goes in each cell and how heavy it is.",
    ],
    cta: "ask", shots: [], source: "generated", hf: "image",
    gen: "Technical illustration, 4:5, cream #F6F3EC ground, thin dark #16150F linework, flat vector isometric style. A corrugated partition insert: flat slotted strips shown separately on the left, and the same strips interlocked into a finished grid of cells on the right, sitting inside the outline of a box. Signal-red #C4362A picks out the slots that interlock. Monospace label, text must render exactly: 3 x 4 CELLS. No photography, no 3D rendering, no shading, no extra text.",
  },
  {
    slug: "print-check-against-artwork", pillar: "R", kind: "video", format: "reel",
    title: "Checking the print against the proof",
    hook: "First sheet off the run gets held up to the light.",
    body: [
      "Registration, colour, position. Checked on the first sheet, not the thousandth.",
      "Send artwork as a vector file where you can. A logo pulled off a website prints exactly as badly as it looks on screen.",
    ],
    cta: "quote", shots: [14, 12], source: "footage",
  },
  {
    slug: "what-changes-a-price", pillar: "S", kind: "post", format: "still",
    title: "Five things that move the price of a carton",
    hook: "It is rarely the thing people expect.",
    body: [
      "Board grade and ply. Size, because it is board area. Quantity, because setup is fixed.",
      "Printing — how many colours, and whether it needs a new die.",
      "And the delivery run, because board is bulky and cheap by weight, so freight is a real slice of what you pay.",
    ],
    cta: "quote", shots: [], source: "generated",
    gen: "Spec-sheet motion graphic. Cream ground, hairline rules, monospace labels. Five factors listed as ruled rows, each row's weight bar extending in signal red as it appears. Instrument-readout register, precise mechanical timing. No photography. 4:5.",
  },

  /* ---- week 9 ---------------------------------------------------------- */
  {
    slug: "bursting-strength-vs-ect", pillar: "B", kind: "video", format: "reel",
    title: "Bursting strength and edge crush are not the same number",
    hook: "One measures a puncture. The other measures a stack.",
    body: [
      "Bursting strength is the pressure it takes to push through the board face. It tells you about impact and rough handling.",
      "Edge crush is how much load the board takes standing on its edge. That is the one that predicts stacking.",
      "A box can be strong on one and ordinary on the other. Ask which number you are being quoted.",
    ],
    cta: "ask", shots: [], source: "generated", hf: "video",
    gen: "Animated technical diagram, 9:16, cream #F6F3EC ground, thin dark #16150F linework, flat vector style, locked-off camera. Split into two halves. Top: a round probe presses down through a flat sheet of corrugated board seen in cross-section until it punctures. Bottom: a short piece of corrugated board stands on its edge and a flat plate descends and crushes it. Signal-red #C4362A arrows show the force direction in both. Precise mechanical motion, no camera movement, no photography, no 3D rendering, no text.",
  },
  {
    slug: "e-flute-for-retail", pillar: "F", kind: "post", format: "carousel",
    title: "The thin board that goes on a shelf",
    hook: "When the box is the packaging, not the shipper.",
    body: [
      "E flute is fine enough that the surface prints almost like a carton board, but it is still corrugated underneath.",
      "So you get a printable retail face with real crush resistance — for the box a customer actually sees.",
      "It is the wrong board for a heavy shipper. Different job entirely.",
    ],
    cta: "ask", shots: [10, 12], source: "mixed",
  },
  {
    slug: "hands-squaring-a-stack", pillar: "R", kind: "video", format: "reel",
    title: "Squaring a stack",
    hook: "Small thing. Decides whether the next machine jams.",
    body: [
      "Board goes through several machines. Every one of them wants the stack square going in.",
      "Most of what makes a run go smoothly is this — done a hundred times a day by people who do not think of it as a skill.",
    ],
    cta: "visit", shots: [11, 9], source: "footage",
  },
  {
    slug: "artwork-file-to-send", pillar: "S", kind: "post", format: "still",
    title: "What artwork file to send us",
    hook: "Vector, with the fonts outlined. Everything else is a compromise.",
    body: [
      "AI, PDF or EPS with text converted to outlines prints at any size.",
      "A JPG or a PNG is fixed at whatever resolution it was saved, and a logo lifted from a website is usually far too small.",
      "Tell us the colours you need matched. Board is brown, so colours sit differently than they do on white.",
    ],
    cta: "quote", shots: [14], source: "mixed",
  },

  /* ---- week 10 --------------------------------------------------------- */
  {
    slug: "stacking-height-is-a-spec", pillar: "B", kind: "video", format: "reel",
    title: "How high you stack is part of the spec",
    hook: "Tell your supplier the stack height. Most people never do.",
    body: [
      "The bottom box has to hold everything above it, for as long as it sits there.",
      "Board also creeps — it loses strength slowly under a constant load, so a stack that is fine on day one can fail in week three.",
      "If you store six high in a warehouse for a month, that is a different box from one that ships two high the same week.",
    ],
    cta: "ask", shots: [21, 22], source: "footage",
  },
  {
    slug: "telescopic-two-piece", pillar: "F", kind: "post", format: "carousel",
    title: "The two-piece box, and why it exists",
    hook: "A lid that slides over the base, not flaps that meet.",
    body: [
      "A telescopic box is a tray and a cap. The overlap where they meet is a double wall on every side.",
      "It handles awkward heights, because the cap can sit lower or higher on the base.",
      "It is also the easy answer when contents vary in depth but the footprint does not.",
    ],
    cta: "ask", shots: [15, 20], source: "mixed",
  },
  {
    slug: "nine-stages-in-thirty-seconds", pillar: "R", kind: "video", format: "short",
    title: "Nine stages, thirty seconds",
    hook: "Reel of paper in. Strapped bundle out.",
    body: [
      "Corrugating, cutting, printing, pasting, scoring, slotting, punching, stitching — and the waste that comes off it.",
      "Every one of those is a step you are paying for, and a step where a job either stays square or does not.",
    ],
    cta: "visit", shots: [4, 9, 12, 15, 16, 17, 18, 19, 22], source: "footage",
  },
  {
    slug: "cheapest-box-most-expensive", pillar: "S", kind: "post", format: "still",
    title: "The cheapest box is often the most expensive one",
    hook: "Count the failures, not the unit price.",
    body: [
      "A box that saves two rupees and fails once in fifty costs you the goods, the freight, the replacement and the phone call.",
      "Work out what one failed dispatch costs. That number is the real budget for the carton.",
      "Then buy the lightest board that clears it — not the heaviest you can afford.",
    ],
    cta: "ask", shots: [], source: "generated",
    gen: "Spec-sheet motion graphic on cream, hairline rules, monospace type. A unit price figure sits small; a second figure for the cost of one failed dispatch counts up beside it until it dwarfs the first. Signal-red numerals, instrument-readout feel. No photography. 4:5.",
  },

  /* ---- week 11 --------------------------------------------------------- */
  {
    slug: "kraft-vs-recycled-liner", pillar: "B", kind: "video", format: "reel",
    title: "Kraft liner and recycled liner",
    hook: "Same colour, roughly. Not the same paper.",
    body: [
      "Virgin kraft has longer fibres, so it is stronger for its weight and holds up better when damp.",
      "Recycled liner has shorter fibres and costs less. For plenty of jobs it is entirely enough.",
      "The point is knowing which you are buying. Both are legitimate; only one of them is what you were quoted.",
    ],
    cta: "ask", shots: [1, 2, 10], source: "footage",
  },
  {
    slug: "handle-cutouts-and-vents", pillar: "F", kind: "post", format: "carousel",
    title: "Hand holes and vents cost you strength",
    hook: "Every hole you cut is strength you gave away.",
    body: [
      "A hand hole in a side panel removes material from a wall that was carrying load.",
      "Placed near a corner it is worse, because the corners carry most of it.",
      "Both are often worth it — produce needs ventilation, heavy boxes need handles. Just design them in, rather than cutting them later.",
    ],
    cta: "ask", shots: [17, 18], source: "mixed",
  },
  {
    slug: "behind-the-four-hour-quote", pillar: "R", kind: "video", format: "reel",
    title: "What happens in those four hours",
    hook: "It is not a delay. It is the work.",
    body: [
      "Board grade chosen against the weight and the journey. Blank size worked back from your internal dimensions. Board area costed, setup costed, delivery costed.",
      "Then it goes to you in writing, so you can hold us to it.",
    ],
    cta: "quote", shots: [9, 11, 21], source: "footage",
  },
  {
    slug: "how-to-test-a-sample", pillar: "S", kind: "post", format: "still",
    title: "Four ways to test a sample in ten minutes",
    hook: "You do not need a lab to catch the obvious problems.",
    body: [
      "Pack it with the real contents and close it the way your line closes it. Check the fit is snug, not tight.",
      "Press a corner hard with your thumb. It should resist, not fold.",
      "Look at the cut edge — the flutes should be open and even, not crushed flat.",
      "Then leave something heavy on top of it overnight.",
    ],
    cta: "sample", shots: [20, 10], source: "mixed",
  },

  /* ---- week 12 --------------------------------------------------------- */
  {
    slug: "top-flap-gap", pillar: "B", kind: "video", format: "reel",
    title: "The gap where the top flaps meet",
    hook: "A finger's gap at the top means the box is the wrong width.",
    body: [
      "On a standard slotted carton the outer flaps should meet in the middle, near enough to touch.",
      "A gap means each flap is short, which means the tape is doing the work the board should be doing.",
      "An overlap that is not designed in is just as wrong — it bulges, and the box stops stacking square.",
    ],
    cta: "ask", shots: [16, 20], source: "footage",
  },
  {
    slug: "multi-depth-scored-box", pillar: "F", kind: "post", format: "carousel",
    title: "One carton, several depths",
    hook: "Extra creases now, fewer SKUs in the store room.",
    body: [
      "Score lines part way up the side let the same box be folded down and closed at a lower height.",
      "One blank, one tooling, several pack sizes — useful when order volumes vary but the product footprint does not.",
      "It also cuts the void fill you are buying to fill half-empty boxes.",
    ],
    cta: "ask", shots: [15, 16], source: "mixed",
  },
  {
    slug: "when-lighter-board-is-enough", pillar: "R", kind: "video", format: "reel",
    title: "When we tell you to buy less board",
    hook: "Sometimes the honest quote is the cheaper one.",
    body: [
      "If the weight and the journey do not need 5 ply, we will say so, and quote the 3 ply.",
      "A supplier who upgrades every enquiry is not protecting your goods. They are protecting their margin.",
      "Tell us the weight and where it goes. The board follows from that.",
    ],
    cta: "quote", shots: [10, 21], source: "footage",
  },
  {
    slug: "delivery-radius", pillar: "S", kind: "post", format: "still",
    title: "Where we deliver from IDA Mallapur",
    hook: "Board is bulky and cheap by weight. Distance shows up in the price.",
    body: [
      "We are on Road No. 13, Plot 75A, IDA Mallapur, and we deliver across Hyderabad and the Telangana industrial belt.",
      "If you are close, that is not a small thing — freight is a real share of what a carton costs delivered.",
    ],
    cta: "visit", shots: [22], source: "generated",
    hf: "image",
    gen: "Schematic map graphic, 4:5, cream #F6F3EC ground, hairline dark linework. Hyderabad industrial estates drawn as a clean diagram, IDA Mallapur marked with a signal-red dot and label. Delivery corridors as thin ruled lines with monospace place labels. Flat technical illustration, no satellite imagery, no photography, no 3D. Text must render exactly: IDA MALLAPUR, HYDERABAD.",
  },

  /* ---- week 13 — the people who run the machines ------------------------ */
  /* Talking head is the format that travels furthest and is the one thing the
     ffmpeg pipeline cannot do: the answers are in Telugu or Hindi, and they
     need transcription before they can be captioned. Higgsfield does that leg.
     The caption bodies below are framing that stays true whatever the answer
     turns out to be — the specifics get added after filming, from what was
     actually said. */
  {
    slug: "how-you-know-it-holds", pillar: "R", kind: "video", format: "reel",
    title: "How do you know a box will hold?",
    hook: "We asked the man who runs the machine.",
    body: [
      "Nobody on this floor guesses. The board is chosen against the weight and the journey, and the joint is chosen against how it will be handled.",
      "Ask your own supplier the same question. A specific answer is a good sign; a reassuring one is not.",
    ],
    cta: "ask", shots: [19, 20], source: "footage", hf: "edit",
  },
  {
    slug: "what-customers-get-wrong", pillar: "S", kind: "video", format: "reel",
    title: "What customers get wrong most often",
    hook: "The mistake we see every single week.",
    body: [
      "Most enquiries arrive missing the one thing that decides the board: what goes inside and what it weighs.",
      "Send the size, the contents, the weight and the monthly quantity, and the quote takes four working hours instead of four emails.",
    ],
    cta: "quote", shots: [11, 9], source: "footage", hf: "edit",
  },
  {
    slug: "hardest-job-this-month", pillar: "R", kind: "video", format: "reel",
    title: "The hardest job we ran this month",
    hook: "Not every job is a plain brown box.",
    body: [
      "Odd sizes, tight tolerances and awkward contents are where a plant either has the tooling and the patience or does not.",
      "If your box is the difficult one, say so in the enquiry. It is the interesting part of the week.",
    ],
    cta: "ask", shots: [17, 20], source: "footage", hf: "edit",
  },
];

/* Weeks are just the bank in fours: the order above is the schedule. */
export const WEEKS = Math.ceil(BANK.length / 4);

export function weekOf(index) {
  return BANK.slice(index * 4, index * 4 + 4);
}

/* ------------------------------------------------------------------ shots */

/* The twenty-two clips from social/SHOOT.md, with what each one shows.
 *
 * Two things read this: the edit builder, which needs a duration to cut to, and
 * the alt-text generator, which needs a sentence describing what is on screen.
 * Alt text is not a formality — it is read aloud to people using a screen reader,
 * and it is one of the few pieces of text Instagram and LinkedIn actually index
 * about an image.
 */
export const SHOTS = {
  1:  { label: "kraft paper reels stacked in the paper store", secs: 15, hero: true },
  2:  { label: "the wound spiral at the flat end of a paper reel", secs: 15 },
  3:  { label: "a hand lifting the loose tail of a kraft reel", secs: 15 },
  4:  { label: "flat paper entering the fluting rolls and coming out as a wave", secs: 20, hero: true },
  5:  { label: "single-face board running, flutes visible along one side", secs: 15 },
  6:  { label: "adhesive being applied to the board", secs: 15 },
  7:  { label: "steam rising off the hot plate", secs: 15 },
  8:  { label: "the paper web running into the corrugator", secs: 15 },
  9:  { label: "cut sheets dropping one after another onto a stack", secs: 20, hero: true },
  10: { label: "the cut edge of a board stack, flute layers countable", secs: 15, hero: true },
  11: { label: "hands tapping a stack of board square", secs: 15 },
  12: { label: "the print roller laying ink onto kraft board", secs: 20, hero: true },
  13: { label: "coloured ink in the printer's tray", secs: 15 },
  14: { label: "a printed sheet held up to the light to check registration", secs: 15 },
  15: { label: "creasing wheels pressing a fold line into board", secs: 15 },
  16: { label: "slotter knives cutting the flaps of a blank", secs: 20 },
  17: { label: "the die closing onto board on the platen press", secs: 20, hero: true },
  18: { label: "the waste skeleton lifted away from cut blanks", secs: 15 },
  19: { label: "the stitching machine firing wire into a box corner", secs: 20, hero: true },
  20: { label: "a flat blank being folded up into a finished box by hand", secs: 20, hero: true },
  21: { label: "strapped bundles of finished boxes stacked in the goods area", secs: 15, hero: true },
  22: { label: "bundles being loaded into a vehicle", secs: 20 },
};

/* ----------------------------------------------------------------- search */

/* One question per piece, in the words a buyer would actually type or say.
 *
 * This is the whole answer-engine layer. A YouTube title that is a question
 * matches the query; a description whose first two lines answer it directly is
 * what gets pulled into a search result, an AI overview, or an assistant's
 * reply. Everything in platforms.mjs is built from this line.
 *
 * `vo` marks the videos where a spoken voice earns its place. The default is no
 * voiceover: machine sound plus text on screen, which is more watchable on mute
 * and needs nobody to record anything. A voice is added only where somebody is
 * explaining a judgement rather than narrating a picture.
 */
export const SEARCH = {
  "flute-is-the-strength":        { q: "what makes a corrugated box strong", vo: true },
  "three-five-seven-ply":         { q: "3 ply vs 5 ply vs 7 ply box which to use" },
  "blank-to-box":                 { q: "how is a corrugated box assembled" },
  "quote-in-four-hours":          { q: "how to get a corrugated box quote fast in Hyderabad" },
  "ink-hitting-board":            { q: "how are corrugated boxes printed" },
  "why-cartons-arrive-crushed":   { q: "why do cartons get crushed in transit", vo: true },
  "the-die-coming-down":          { q: "what is die cutting in box manufacturing" },
  "mailer-vs-carton":             { q: "mailer box vs shipping carton which is better" },
  "one-box-three-heights":        { q: "multi depth box with extra crease lines" },
  "what-gsm-tells-you":           { q: "what does GSM mean in corrugated board" },
  "inside-ida-mallapur":          { q: "corrugated box manufacturer in IDA Mallapur Hyderabad" },
  "why-minimum-500":              { q: "minimum order quantity for custom corrugated boxes" },
  "the-stack-test":               { q: "how much weight can a corrugated box stack hold", vo: true },
  "five-questions-before-you-order": { q: "what to ask a corrugated box supplier before ordering" },
  "loading-out":                  { q: "corrugated box delivery in Hyderabad" },
  "send-us-the-size":             { q: "what details are needed to quote a custom box" },
  "flute-direction":              { q: "which way should corrugated flutes run in a box", vo: true },
  "rsc-the-default-box":          { q: "what is a regular slotted container RSC box" },
  "the-waste-skeleton":           { q: "what happens to corrugated waste after die cutting" },
  "internal-vs-external":         { q: "internal vs external box dimensions difference" },
  "corner-fails-first":           { q: "where does a corrugated box fail first", vo: true },
  "flute-types-abce":             { q: "A B C E flute difference corrugated board" },
  "machine-sound-only":           { q: "inside a corrugated box factory" },
  "measure-a-box":                { q: "how to measure a box length width height" },
  "glue-or-stitch":               { q: "glued vs stitched corrugated box joint", vo: true },
  "full-overlap-for-heavy":       { q: "full overlap box for heavy products" },
  "reels-arriving":               { q: "what paper is used to make corrugated boxes" },
  "sample-before-bulk":           { q: "should I order a box sample before bulk" },
  "monsoon-and-board":            { q: "does humidity weaken corrugated boxes", vo: true },
  "partitions-and-inserts":       { q: "corrugated partitions for bottles and vials" },
  "print-check-against-artwork":  { q: "what artwork file format for box printing" },
  "what-changes-a-price":         { q: "what affects the price of a corrugated box" },
  "bursting-strength-vs-ect":     { q: "bursting strength vs edge crush test difference", vo: true },
  "e-flute-for-retail":           { q: "what is E flute used for" },
  "hands-squaring-a-stack":       { q: "how corrugated boxes are made step by step" },
  "artwork-file-to-send":         { q: "what file to send for corrugated box printing" },
  "stacking-height-is-a-spec":    { q: "how high can you stack corrugated boxes", vo: true },
  "telescopic-two-piece":         { q: "what is a telescopic two piece box" },
  "nine-stages-in-thirty-seconds":{ q: "corrugated box manufacturing process steps" },
  "cheapest-box-most-expensive":  { q: "is a cheaper carton worth it" },
  "kraft-vs-recycled-liner":      { q: "kraft liner vs recycled liner difference" },
  "handle-cutouts-and-vents":     { q: "do hand holes weaken a corrugated box" },
  "behind-the-four-hour-quote":   { q: "how is a corrugated box price calculated" },
  "how-to-test-a-sample":         { q: "how to test a corrugated box sample" },
  "top-flap-gap":                 { q: "why is there a gap between box flaps" },
  "multi-depth-scored-box":       { q: "one box multiple heights scored" },
  "when-lighter-board-is-enough": { q: "do I need 5 ply or is 3 ply enough", vo: true },
  "delivery-radius":              { q: "corrugated box supplier near IDA Mallapur" },
  "how-you-know-it-holds":        { q: "how do you know a box will hold before shipping" },
  "what-customers-get-wrong":     { q: "common mistakes when ordering custom boxes" },
  "hardest-job-this-month":       { q: "custom corrugated box for an awkward product" },
};

/* What is on screen, said in a sentence, for people who cannot see it. */
export function altText(entry) {
  if (entry.source === "generated") {
    return `Diagram: ${entry.title.toLowerCase()}. Drawn as a technical illustration, not a photograph.`;
  }
  const shots = (entry.shots || []).map((n) => SHOTS[n]?.label).filter(Boolean);
  if (!shots.length) return entry.title;
  const head = entry.kind === "video" ? "Filmed at the factory:" : "Photographed at the factory:";
  return `${head} ${shots.slice(0, 3).join("; ")}.`;
}
