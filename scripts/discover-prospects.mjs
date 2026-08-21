/* Human-reviewed outbound discovery pipeline.
 *
 * This script accepts real URLs from a discovery source, runs the installed
 * ai-sales-team analyzers, and writes unverified records to outbound_prospects.
 * It never sends outreach. Use a file of URLs exported from Exa/Firecrawl or a
 * reviewed search result list: node scripts/discover-prospects.mjs urls.txt
 */
import fs from "node:fs/promises";
import { spawn } from "node:child_process";

const input = process.argv[2];
const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const scripts = process.env.AI_SALES_TEAM_ROOT || "C:/Users/001sa/.claude/local-plugins/ai-sales-team/scripts";
if (!input || !supabaseUrl || !serviceKey) {
  console.error("Usage: node scripts/discover-prospects.mjs urls.txt");
  console.error("Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. URLs must come from a real, reviewed discovery source.");
  process.exit(1);
}

const urls = (await fs.readFile(input, "utf8")).split(/\r?\n/).map((v) => v.trim()).filter((v) => /^https?:\/\//i.test(v));
const run = (file, args, inputText = "", timeoutMs = 20_000) => new Promise((resolve, reject) => {
  const child = spawn(process.env.PYTHON || "python", [file, ...args], { stdio: [inputText ? "pipe" : "ignore", "pipe", "inherit"] });
  let out = "";
  let settled = false;
  const finish = (callback) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    callback();
  };
  const timer = setTimeout(() => {
    child.kill();
    finish(() => reject(new Error(`${file} timed out after ${timeoutMs / 1000}s`)));
  }, timeoutMs);
  child.stdout.on("data", (chunk) => { out += chunk; });
  if (inputText) { child.stdin.write(inputText); child.stdin.end(); }
  child.on("error", (error) => finish(() => reject(error)));
  child.on("close", (code) => finish(() => code === 0 ? resolve(JSON.parse(out)) : reject(new Error(`${file} exited ${code}`))));
});
const scoreInput = (analysis, contacts) => ({ company: analysis.company_name, budget_signals: { employee_count: Number(analysis.company_size_signals?.estimated_employees || 0), pricing_visible: analysis.pricing_tiers?.length > 0 }, authority_signals: { decision_makers_found: contacts.contacts?.length || 0, c_suite_identified: contacts.contacts?.some((c) => c.seniority === "C-Suite") || false }, need_signals: { pain_points_detected: analysis.industry_signals?.length || 0, job_posts_relevant: analysis.has_job_postings || false }, timeline_signals: { hiring_for_role: analysis.has_job_postings || false } });
for (const url of urls) {
  try {
    const analysis = await run(`${scripts}/analyze_prospect.py`, ["--url", url, "--output", "json"]);
    let contacts;
    try {
      contacts = await run(`${scripts}/contact_finder.py`, ["--url", url, "--output", "json"]);
    } catch (error) {
      contacts = { contacts: [], errors: [error.message] };
      console.error(`contact finder warning for ${url}: ${error.message}`);
    }
    const score = await run(`${scripts}/lead_scorer.py`, [], JSON.stringify(scoreInput(analysis, contacts)));
    const payload = { company_name: analysis.company_name || new URL(url).hostname, website_url: url, city: "Hyderabad", industry: analysis.industry_signals?.[0] || null, description: analysis.description || null, contact_email: analysis.contact_info?.emails?.[0] || null, contact_phone: analysis.contact_info?.phones?.[0] || null, contacts: contacts.contacts || [], analysis, score, is_verified: false };
    const res = await fetch(`${supabaseUrl}/rest/v1/outbound_prospects?on_conflict=website_url`, { method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
    console.log(`stored ${url}`);
  } catch (error) { console.error(`skipped ${url}: ${error.message}`); }
}
