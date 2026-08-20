export type BoxType = {
  slug: string;
  name: string;
  short: string;
  description: string;
  image: string;
  bestFor: string;
  ply: string;
};

export const boxTypes: BoxType[] = [
  { slug: "kraft-shipping-boxes", name: "Kraft shipping boxes", short: "Reliable corrugated shippers for regular dispatches.", description: "Brown kraft cartons for warehouse, transport and distribution requirements.", image: "/images/products/shipping-0-0.avif", bestFor: "Warehousing and distribution", ply: "3 or 5 ply" },
  { slug: "white-shipping-boxes", name: "White shipping boxes", short: "A cleaner outer surface for dispatch cartons.", description: "White-faced corrugated cartons for businesses that need a neat, professional shipping finish.", image: "/images/products/shipping-0-1.avif", bestFor: "Retail and dispatch", ply: "3 or 5 ply" },
  { slug: "double-wall-boxes", name: "Double wall boxes", short: "Extra board for heavier consignments.", description: "Double-wall cartons for increased stacking strength and protection in transit.", image: "/images/products/shipping-0-3.avif", bestFor: "Industrial and freight", ply: "5 ply" },
  { slug: "triple-wall-boxes", name: "Triple wall boxes", short: "Heavy-duty protection for demanding loads.", description: "Triple-wall cartons for high-load, long-distance and industrial packaging applications.", image: "/images/products/shipping-0-4.avif", bestFor: "Heavy equipment and freight", ply: "7 ply" },
  { slug: "cube-boxes", name: "Cube boxes", short: "Consistent geometry for compact handling.", description: "Square-format corrugated boxes for products that need balanced storage and transport.", image: "/images/products/shipping-0-5.avif", bestFor: "Parts and general dispatch", ply: "3 or 5 ply" },
  { slug: "telescoping-boxes", name: "Telescoping boxes", short: "Adjustable-length protection for long products.", description: "Two-piece telescoping cartons for long, irregular or height-sensitive products.", image: "/images/products/shipping-1-0.avif", bestFor: "Profiles and long components", ply: "5 ply" },
  { slug: "flat-boxes", name: "Flat boxes", short: "Low-profile cartons for easy stacking.", description: "Flat-format boxes for documents, components, panels and compact products.", image: "/images/products/shipping-1-1.avif", bestFor: "Flat products and components", ply: "3 or 5 ply" },
  { slug: "multi-depth-boxes", name: "Multi-depth boxes", short: "One blank with multiple height options.", description: "Creased multi-depth cartons that adapt to different product heights and pack plans.", image: "/images/products/shipping-1-2.avif", bestFor: "Variable-size fulfilment", ply: "3 or 5 ply" },
  { slug: "tab-locking-mailer-boxes", name: "Tab-locking mailer boxes", short: "Secure self-locking presentation cartons.", description: "Tab-locking mailer formats for shipping and shelf presentation without separate tape.", image: "/images/products/specialty-0-0.avif", bestFor: "Retail and mail order", ply: "3 ply" },
  { slug: "indestructo-mailers", name: "Indestructo mailers", short: "Reinforced mailers for repeat handling.", description: "Sturdy mailer constructions designed for parcel networks and repeated handling points.", image: "/images/products/specialty-0-1.avif", bestFor: "Parcel and ecommerce operations", ply: "3 or 5 ply" },
  { slug: "easy-fold-mailers", name: "Easy fold mailers", short: "Fast packing with clean folded edges.", description: "Easy-fold mailer blanks for efficient packing lines and consistent dispatch presentation.", image: "/images/products/specialty-0-2.avif", bestFor: "Assembly and fulfilment", ply: "3 ply" },
  { slug: "reverse-tuck-corrugated-boxes", name: "Reverse tuck corrugated boxes", short: "Practical tuck-end cartons for product packing.", description: "Reverse tuck-end corrugated boxes for fast closing, storage and distribution.", image: "/images/products/specialty-0-3.avif", bestFor: "Retail and packaged goods", ply: "3 ply" },
  { slug: "sbs-cardboard-boxes", name: "SBS and cardboard boxes", short: "Clean-fold cartons for lighter applications.", description: "SBS and cardboard carton formats for product packs, inserts and secondary packaging.", image: "/images/products/specialty-0-4.avif", bestFor: "Retail and light products", ply: "Cardboard" },
  { slug: "chipboard-cartons", name: "Chipboard cartons", short: "Rigid folding cartons for organised packing.", description: "Chipboard cartons for component packing, retail sets and internal product protection.", image: "/images/products/specialty-0-5.avif", bestFor: "Components and retail sets", ply: "Chipboard" },
  { slug: "chipboard-boxes", name: "Chipboard boxes", short: "Lightweight board boxes with a neat fold.", description: "Chipboard box formats for small goods, inserts and organised internal packaging.", image: "/images/products/specialty-1-0.avif", bestFor: "Small goods and inserts", ply: "Chipboard" },
  { slug: "pizza-boxes", name: "Pizza boxes", short: "Stackable food cartons for delivery operations.", description: "Corrugated pizza boxes for kitchens and food distribution teams that need repeatable sizing.", image: "/images/products/specialty-1-1.avif", bestFor: "Food service and delivery", ply: "3 ply" },
  { slug: "file-storage-boxes", name: "File storage boxes", short: "Organised storage for records and archives.", description: "Stackable corrugated file storage boxes for offices, archives and document logistics.", image: "/images/products/specialty-1-2.avif", bestFor: "Records and archives", ply: "3 or 5 ply" },
  { slug: "corrugated-bins", name: "Corrugated bins", short: "Open-top handling bins for workstations.", description: "Open corrugated bins for line-side storage, sorting and warehouse handling.", image: "/images/products/specialty-1-3.avif", bestFor: "Warehouses and production lines", ply: "3 or 5 ply" },
  { slug: "corrugated-trays", name: "Corrugated trays", short: "Open formats for display and handling.", description: "Corrugated trays for product presentation, packing lines and grouped movement.", image: "/images/products/specialty-1-4.avif", bestFor: "Display and handling", ply: "3 or 5 ply" },
  { slug: "corrugated-tubes", name: "Corrugated tubes", short: "Protective sleeves for long components.", description: "Corrugated tubes and sleeves for profiles, rolls and long products during transit.", image: "/images/products/specialty-1-5.avif", bestFor: "Long products and profiles", ply: "3 or 5 ply" },
];

export const getBoxType = (slug: string) => boxTypes.find((item) => item.slug === slug);
