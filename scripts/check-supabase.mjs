// Dev-only connectivity check — NOT a Next.js route, so it never ships in
// the production build or app bundle. Confirms the Supabase project is
// reachable and that migration 001 has been run, using only the public
// anon key (same access level the app itself uses).
//
// Usage:
//   node --env-file=.env.local scripts/check-supabase.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Copy .env.local.example to .env.local, fill in your Supabase project values, then re-run:\n" +
      "  node --env-file=.env.local scripts/check-supabase.mjs"
  );
  process.exit(1);
}

const TABLES = [
  "landing_pages",
  "landing_products",
  "landing_features",
  "landing_metrics",
  "landing_specifications",
  "landing_faqs",
  "landing_process_steps",
  "landing_company_info",
  "landing_page_seo_settings",
];

async function checkTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    return { table, ok: false, detail: `${res.status} ${res.statusText} — ${body}` };
  }

  const rows = await res.json();
  return { table, ok: true, detail: `reachable (${rows.length} row${rows.length === 1 ? "" : "s"} returned)` };
}

console.log(`Checking Supabase project: ${url}\n`);

const results = await Promise.all(TABLES.map(checkTable));

for (const result of results) {
  console.log(`${result.ok ? "✓" : "✗"} ${result.table} — ${result.detail}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(
    `\n${failed.length} table(s) not reachable. Make sure supabase/migrations/001_create_landing_page_schema.sql has been run in the Supabase SQL Editor.`
  );
  process.exit(1);
}

console.log("\nAll tables reachable with the anon key. Connection OK.");
