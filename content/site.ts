// Google has no address-level record for the plot; querying the full string makes
// it pin a neighbouring business instead. The road resolves exactly, so the map
// pins Road No. 13 and the plot number is carried by the caption beneath it.
const mapQuery = "Road No 13, IDA Mallapur, Hyderabad, Telangana 500076";

export const site = {
  name: "Quality Enterprises",
  address: "Road No. 13, Plot No. 75A, IDA Mallapur, Hyderabad, Telangana 500076",
  addressParts: { street: "Road No. 13, Plot No. 75A, IDA Mallapur", locality: "Hyderabad", region: "Telangana", postalCode: "500076", country: "IN" },
  area: "IDA Mallapur",
  phone: "+91 94404 32434",
  phoneHref: "tel:+919440432434",
  email: "qualityenterprisea1@gmail.com",
  emailAlt: "quality-enterprises@outlook.com",
  /* <!-- UNVERIFIED --> */ gstin: "GSTIN pending",
  hours: "Mon-Sat, 9:30-18:30",
  moq: "500 boxes",
  quoteSla: "4 working hours",
  // Keyless embed form: works without a Maps API key and needs no client JS.
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`,
  mapLink: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`,
};
