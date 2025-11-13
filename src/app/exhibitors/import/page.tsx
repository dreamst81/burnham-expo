"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* -------------------------------------------------------
   🔥 TYPE DEFINITIONS
--------------------------------------------------------- */

type BoothEntry = {
  booth_number: string;
  zone: string;
};

type ExhibitorParsed = {
  name: string;
  category: string | null;
  website: string | null;
  boothEntries: BoothEntry[];
};

/* -------------------------------------------------------
   🔥 DETERMINE NUMERIC ZONE
--------------------------------------------------------- */
function determineNumericZone(n: number): string {
  const base = Math.floor(n / 100) * 100;
  return `${base}–${base + 99}`;
}

/* -------------------------------------------------------
   🔥 BOOTH PARSER
--------------------------------------------------------- */
function parseBoothString(raw: string | null): BoothEntry[] {
  if (!raw) return [];

  const parts = raw
    .trim()
    .split(",")
    .map((p) => p.trim());

  const results: BoothEntry[] = [];

  for (const part of parts) {
    if (!part) continue;

    // Named zone with range — “UAV West 21-23”
    const namedRange = part.match(/^([A-Za-z\s]+)\s+(\d+)[–-](\d+)$/);
    if (namedRange) {
      const zone = namedRange[1].trim();
      const start = parseInt(namedRange[2], 10);
      const end = parseInt(namedRange[3], 10);

      for (let n = start; n <= end; n++) {
        results.push({ booth_number: String(n), zone });
      }
      continue;
    }

    // Pure range — “4-7”
    const pureRange = part.match(/^(\d+)[–-](\d+)$/);
    if (pureRange) {
      const start = parseInt(pureRange[1], 10);
      const end = parseInt(pureRange[2], 10);

      for (let n = start; n <= end; n++) {
        results.push({
          booth_number: String(n),
          zone: determineNumericZone(n),
        });
      }
      continue;
    }

    // Named zone with single number — “Demo Shoothouse 2”
    const namedSingle = part.match(/^([A-Za-z\s]+)\s+(\d+)$/);
    if (namedSingle) {
      results.push({
        booth_number: namedSingle[2],
        zone: namedSingle[1].trim(),
      });
      continue;
    }

    // Numeric or alphanumeric — “108p” or “207A”
    const numMatch = part.match(/^(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      results.push({
        booth_number: part,
        zone: determineNumericZone(num),
      });
      continue;
    }

    // Pure text — “Outdoor Demo”
    if (/^[A-Za-z\s]+$/.test(part)) {
      results.push({
        booth_number: "N/A",
        zone: part.trim(),
      });
      continue;
    }

    // Fallback
    results.push({
      booth_number: part,
      zone: "Unassigned",
    });
  }

  return results;
}

/* -------------------------------------------------------
   🔥 HTML PARSER → EXHIBITOR PARSED OBJECTS
--------------------------------------------------------- */
function parseHtmlToExhibitors(html: string): ExhibitorParsed[] {
  const container = document.createElement("div");
  container.innerHTML = html;

  const cards = Array.from(
    container.querySelectorAll('[class*="ExhibitorsStyles__exhibitor-card"]')
  ) as HTMLElement[];

  const parsed: ExhibitorParsed[] = [];

  for (const card of cards) {
    // Name
    const nameEl = card.querySelector(
      '[class*="ExhibitorsStyles__card-header"] [class*="placeholder"]'
    ) as HTMLElement | null;

    const name = nameEl?.textContent?.trim() || "";
    if (!name) continue;

    // Booth raw text
    const locEl = card.querySelector(
      '[class*="ExhibitorsStyles__location-text"]'
    ) as HTMLElement | null;

    const boothRaw =
      (locEl?.textContent?.trim() as string | null) ?? null;

    // Category
    const catEl = card.querySelector(
      '[class*="ExhibitorsStyles__categories"] span'
    ) as HTMLElement | null;

    const category = catEl?.textContent?.trim() || null;

    // Website
    const linkEl = card.querySelector("a[href^='http']") as
      | HTMLAnchorElement
      | null;

    const website = linkEl?.getAttribute("href") || null;

    // Booth entries parsed
    const boothEntries = parseBoothString(boothRaw);

    parsed.push({
      name,
      category,
      website,
      boothEntries,
    });
  }

  return parsed;
}

/* -------------------------------------------------------
   🔥 MAIN COMPONENT
--------------------------------------------------------- */
export default function ImportExhibitorsPage() {
  const [rawHtml, setRawHtml] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  async function handleImport() {
    setStatus(null);

    if (!rawHtml.trim()) {
      setStatus("Paste HTML first.");
      return;
    }

    const parsed = parseHtmlToExhibitors(rawHtml);

    if (parsed.length === 0) {
      setStatus("No exhibitors found.");
      return;
    }

    // Deduplicate by name
    const exhibitorMap: Record<string, ExhibitorParsed> = {};
    parsed.forEach((ex) => {
      exhibitorMap[ex.name] = ex;
    });

    const uniqueExhibitors = Object.values(exhibitorMap);

    setInserting(true);

    /* -------------------------------------------------------
       1. UPSERT EXHIBITORS
    --------------------------------------------------------- */
    const upsertPayload = uniqueExhibitors.map((ex) => ({
      name: ex.name,
      category: ex.category,
      website: ex.website,
    }));

    const { data: upserted, error: upsertErr } = await supabase
      .from("exhibitors")
      .upsert(upsertPayload, { onConflict: "name" })
      .select("id,name");

    if (upsertErr) {
      setInserting(false);
      setStatus("Error inserting exhibitors: " + upsertErr.message);
      return;
    }

    const idMap: Record<string, string> = {};
    upserted?.forEach((row) => {
      idMap[row.name] = row.id;
    });

    /* -------------------------------------------------------
       2. CLEAR OLD BOOTHS
    --------------------------------------------------------- */
    await supabase.from("booths").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    /* -------------------------------------------------------
       3. INSERT BOOTH RECORDS
    --------------------------------------------------------- */
    const boothPayload: {
  exhibitor_id: string;
  booth_number: string;
  zone: string;
  trade_show_id: string;
}[] = [];

    uniqueExhibitors.forEach((ex) => {
      const exhibitor_id = idMap[ex.name];

      ex.boothEntries.forEach((b: BoothEntry) => {
  boothPayload.push({
    exhibitor_id,
    booth_number: b.booth_number,
    zone: b.zone,
    trade_show_id: "341ac0f3-82e0-484a-9809-ff512d6722a4"
  });
});
    });

    const { error: boothErr } = await supabase
      .from("booths")
      .insert(boothPayload);

    setInserting(false);

    if (boothErr) {
      setStatus("Error inserting booths: " + boothErr.message);
      return;
    }

    setStatus(
      `Imported ${uniqueExhibitors.length} exhibitors and ${boothPayload.length} booth entries.`
    );
  }

  /* -------------------------------------------------------
     🔥 UI
  --------------------------------------------------------- */
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Import Exhibitors</h1>
        
      <textarea
        value={rawHtml}
        onChange={(e) => setRawHtml(e.target.value)}
        className="w-full min-h-[250px] border rounded-lg p-3 font-mono text-sm"
        placeholder="Paste exhibitors HTML here…"
      />

      <button
        onClick={handleImport}
        disabled={inserting}
        className="bg-[#3b4522] text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {inserting ? "Importing…" : "Import Exhibitors"}
      </button>

      {status && <p className="text-gray-700">{status}</p>}
    </div>
  );
}