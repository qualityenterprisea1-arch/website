export type BoxType = {
  slug: string;
  name: string;
  short: string;
  description: string;
  colour: string;
  bestFor: string;
  ply: string;
};

export const boxTypes: BoxType[] = [
  { slug: "rsc-shipping-boxes", name: "RSC shipping boxes", short: "The dependable everyday shipper.", description: "Regular slotted cartons for ecommerce, warehouses and courier runs.", colour: "#C69C6D", bestFor: "E-commerce and logistics", ply: "3 or 5 ply" },
  { slug: "printed-mailer-boxes", name: "Printed mailer boxes", short: "A clean unboxing moment.", description: "Self-locking mailers with practical print coverage for D2C brands.", colour: "#1D3FBF", bestFor: "D2C and apparel", ply: "3 ply" },
  { slug: "food-bakery-boxes", name: "Food and bakery boxes", short: "Made for the last mile.", description: "Food-safe board formats for cloud kitchens, bakeries and takeaway counters.", colour: "#D7A447", bestFor: "Cloud kitchens and bakeries", ply: "3 ply" },
  { slug: "pizza-boxes", name: "Pizza boxes", short: "Flat, sturdy, stackable.", description: "Ventilated pizza cartons cut for reliable stacking and clean delivery.", colour: "#D6402F", bestFor: "Pizzerias and food delivery", ply: "3 ply" },
  { slug: "heavy-duty-cartons", name: "Heavy duty cartons", short: "More wall for heavier loads.", description: "Double and triple-wall cartons for machinery, parts and long-haul freight.", colour: "#4A4038", bestFor: "Industrial and logistics", ply: "5 or 7 ply" },
  { slug: "fruit-vegetable-crates", name: "Fruit and vegetable crates", short: "Ventilation without the wobble.", description: "Strong produce crates with ventilation built into the cut pattern.", colour: "#5D7642", bestFor: "Growers and distributors", ply: "5 ply" },
  { slug: "sheets-pads-partitions", name: "Sheets, pads and partitions", short: "The parts inside the box.", description: "Flat sheets, separators and pads that stop products moving in transit.", colour: "#9A7B59", bestFor: "Pack lines and fragile goods", ply: "3 or 5 ply" },
  { slug: "corrugated-rolls-liners", name: "Corrugated rolls and liners", short: "Protection by the metre.", description: "Flexible wrap and liner material for awkward shapes and interleaving.", colour: "#7B5E43", bestFor: "Warehouses and movers", ply: "Single wall" },
];

export const getBoxType = (slug: string) => boxTypes.find((item) => item.slug === slug);
