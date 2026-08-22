/* Excel export for the leads desk.
 *
 * Deliberately a real .xlsx rather than a CSV, for one reason that matters more
 * than formatting: Excel mangles CSV phone numbers. "+919885055516" survives,
 * but a landline written 04027200343 loses its leading zero, and anything long
 * enough tips into scientific notation. A sales sheet whose phone numbers are
 * subtly wrong is worse than no sheet. Every number column here is written as
 * an explicit text cell.
 *
 * exceljs is imported dynamically by the caller so it never ships in the page
 * bundle - it loads only when somebody actually clicks Export.
 */

type Prospect = {
  company_name: string; grade: string; score_total: number;
  proximity_band: string | null; industry: string | null;
  contact_name: string | null; contact_title: string | null;
  contact_phone: string | null; contact_email: string | null;
  phones: { phone: string }[]; emails: { email: string }[];
  address: string | null; district: string | null;
  website_url: string | null; source_url: string | null;
  recommended_action: string | null; status: string;
  is_verified: boolean; do_not_contact: boolean; notes: string | null;
  contacts: { name: string; title: string; source_url?: string }[];
  last_enriched_at: string | null;
};

type Quote = {
  created_at: string; name: string; company: string | null;
  phone: string; email: string | null;
  box_type: string; length: string; width: string; height: string; unit: string;
  ply: string; quantity: number; printing: string;
  area: string | null; city: string | null; status: string; notes: string | null;
};

const PROX: Record<string, string> = {
  "same-corridor": "Same corridor", "same-district": "Same district", hyderabad: "Hyderabad",
  "telangana-industrial": "TS industrial belt", telangana: "Telangana",
  outside: "Outside area", unknown: "Unknown — no address",
};

const INK = "FF1A1714", PAPER = "FFF8F6F2", LINE = "FFC9C2B4";
// Grade wears the site's ordinal ramp: darker is better, never a rainbow.
const GRADE_FILL: Record<string, string> = {
  A: "FF14407A", B: "FF2E6099", C: "FF6E93BC", D: "FFB6C6D9", X: "FFD7D4CB",
};
const GRADE_TEXT: Record<string, string> = {
  A: "FFFFFFFF", B: "FFFFFFFF", C: "FF10233B", D: "FF10233B", X: "FF5A5249",
};

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

/** Build and download an .xlsx of the current view. */
export async function exportWorkbook(
  kind: "outbound" | "inbound",
  prospects: Prospect[],
  quotes: Quote[],
) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quality Enterprises leads desk";
  wb.created = new Date();

  if (kind === "outbound") buildProspects(wb, prospects);
  else buildQuotes(wb, quotes);

  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  download(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `qe-${kind}-${stamp}.xlsx`);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  // Revoke on the next tick; revoking synchronously cancels the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function styleHeader(sheet: any) {
  const row = sheet.getRow(1);
  row.font = { bold: true, size: 10, color: { argb: PAPER } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  row.alignment = { vertical: "middle" };
  row.height = 24;
  // Freeze the header and turn on filters so a call sheet is workable on open.
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

function buildProspects(wb: any, rows: Prospect[]) {
  const sheet = wb.addWorksheet("Prospects", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheet.columns = [
    { header: "Grade", key: "grade", width: 7 },
    { header: "Score", key: "score", width: 7 },
    { header: "Company", key: "company", width: 38 },
    { header: "Contact", key: "contact", width: 24 },
    { header: "Title", key: "title", width: 26 },
    { header: "Phone", key: "phone", width: 17 },
    { header: "Other phones", key: "phones", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Distance", key: "prox", width: 18 },
    { header: "Address", key: "address", width: 46 },
    { header: "Industry", key: "industry", width: 14 },
    { header: "Next action", key: "action", width: 46 },
    { header: "Status", key: "status", width: 12 },
    { header: "Verified", key: "verified", width: 9 },
    { header: "Do not contact", key: "dnc", width: 14 },
    { header: "Notes", key: "notes", width: 40 },
    { header: "Website", key: "website", width: 32 },
    { header: "Source", key: "source", width: 32 },
    { header: "Harvested", key: "harvested", width: 13 },
  ];

  for (const p of rows) {
    const others = (p.phones ?? []).map((x) => x.phone).filter((x) => x !== p.contact_phone);
    sheet.addRow({
      grade: p.grade,
      score: p.score_total,
      company: p.company_name,
      contact: p.contact_name ?? "",
      title: p.contact_title ?? "",
      phone: p.contact_phone ?? "",
      phones: others.join("  "),
      email: p.contact_email ?? "",
      prox: PROX[p.proximity_band ?? ""] ?? "",
      address: p.address ?? "",
      industry: p.industry ?? "",
      action: p.recommended_action ?? "",
      status: p.status,
      verified: p.is_verified ? "yes" : "",
      dnc: p.do_not_contact ? "DO NOT CONTACT" : "",
      notes: p.notes ?? "",
      website: p.website_url?.startsWith("urn:") ? "none on record" : (p.website_url ?? ""),
      source: p.source_url ?? "",
      harvested: fmtDate(p.last_enriched_at),
    });
  }

  styleHeader(sheet);

  sheet.eachRow((row: any, n: number) => {
    if (n === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.height = 30;

    const grade = String(row.getCell("grade").value ?? "D");
    const g = row.getCell("grade");
    g.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRADE_FILL[grade] ?? GRADE_FILL.D } };
    g.font = { bold: true, color: { argb: GRADE_TEXT[grade] ?? GRADE_TEXT.D } };
    g.alignment = { horizontal: "center", vertical: "middle" };

    row.getCell("score").alignment = { horizontal: "right", vertical: "top" };
    row.getCell("company").font = { bold: true };

    // The whole point of using xlsx: keep numbers as text so Excel cannot
    // reformat a phone number into something that no longer dials.
    for (const key of ["phone", "phones"]) {
      const cell = row.getCell(key);
      cell.numFmt = "@";
      cell.value = cell.value == null ? "" : String(cell.value);
      cell.alignment = { horizontal: "left", vertical: "top" };
    }

    if (String(row.getCell("dnc").value ?? "")) {
      row.getCell("dnc").font = { bold: true, color: { argb: "FFC0392B" } };
    }
    if (String(row.getCell("verified").value ?? "")) {
      row.getCell("verified").font = { color: { argb: "FF1B7F4B" } };
    }
    for (const key of ["website", "source"]) {
      row.getCell(key).font = { size: 9, color: { argb: "FF5A5249" } };
    }
  });

  // A second sheet for the buying committee, so the call sheet stays readable.
  const people = wb.addWorksheet("Contacts");
  people.columns = [
    { header: "Company", key: "company", width: 38 },
    { header: "Name", key: "name", width: 26 },
    { header: "Title", key: "title", width: 40 },
    { header: "Phone", key: "phone", width: 17 },
    { header: "Profile / source", key: "src", width: 52 },
  ];
  for (const p of rows) {
    for (const c of p.contacts ?? []) {
      people.addRow({
        company: p.company_name, name: c.name, title: c.title,
        phone: p.contact_phone ?? "", src: c.source_url ?? "",
      });
    }
  }
  styleHeader(people);
  people.eachRow((row: any, n: number) => {
    if (n === 1) return;
    const cell = row.getCell("phone");
    cell.numFmt = "@";
    cell.value = cell.value == null ? "" : String(cell.value);
    row.getCell("src").font = { size: 9, color: { argb: "FF5A5249" } };
  });
}

function buildQuotes(wb: any, rows: Quote[]) {
  const sheet = wb.addWorksheet("Quote requests", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  sheet.columns = [
    { header: "Received", key: "received", width: 14 },
    { header: "Name", key: "name", width: 24 },
    { header: "Company", key: "company", width: 28 },
    { header: "Phone", key: "phone", width: 17 },
    { header: "Email", key: "email", width: 30 },
    { header: "Format", key: "format", width: 26 },
    { header: "Size", key: "size", width: 22 },
    { header: "Ply", key: "ply", width: 11 },
    { header: "Quantity", key: "qty", width: 10 },
    { header: "Printing", key: "printing", width: 13 },
    { header: "Delivery", key: "delivery", width: 24 },
    { header: "Status", key: "status", width: 12 },
    { header: "Notes", key: "notes", width: 44 },
  ];
  for (const q of rows) {
    sheet.addRow({
      received: fmtDate(q.created_at),
      name: q.name, company: q.company ?? "", phone: q.phone, email: q.email ?? "",
      format: q.box_type,
      size: `${q.length} x ${q.width} x ${q.height} ${q.unit}`,
      ply: q.ply, qty: q.quantity, printing: q.printing,
      delivery: [q.area, q.city].filter(Boolean).join(", ") || "Ask on the call",
      status: q.status, notes: q.notes ?? "",
    });
  }
  styleHeader(sheet);
  sheet.eachRow((row: any, n: number) => {
    if (n === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.getCell("name").font = { bold: true };
    const cell = row.getCell("phone");
    cell.numFmt = "@";
    cell.value = cell.value == null ? "" : String(cell.value);
  });
  sheet.getColumn("qty").alignment = { horizontal: "right" };
}

// Border colour is applied last so it does not fight the grade fills above.
export const SHEET_LINE = LINE;
