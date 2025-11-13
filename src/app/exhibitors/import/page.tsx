"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* -------------------------------------------------------
   🔥 SUPER-PARSER: Parses booth strings into usable entries
--------------------------------------------------------- */
function parseBoothString(raw: string | null): {
  booth_number: string;
  zone: string;
}[] {
  if (!raw) return [];

  const cleaned = raw.trim();

  // Split comma-separated booth entries
  const parts = cleaned.split(",").map((p) => p.trim());

  const results: { booth_number: string; zone: string }[] = [];

  for (const part of parts) {
    if (!part) continue;

    /* -----------------------------
       CASE 1: Named zone w/ range
       Example: "UAV West 21-23"
    ------------------------------ */
    const namedRangeMatch = part.match(/^([A-Za-z\s]+)\s+(\d+)[–-](\d+)$/);
    if (namedRangeMatch) {
      const zone = namedRangeMatch[1].trim();
      const start = parseInt(namedRangeMatch[2], 10);
      const end = parseInt(namedRangeMatch[3], 10);

      for (let n = start; n <= end; n++) {
        results.push({
          booth_number: String(n),
          zone,
        });
      }
      continue;
    }

    /* -----------------------------
       CASE 2: Range only
       Example: "4-7"
    ------------------------------ */
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

    /* -----------------------------
       CASE 3: Named zone w/ single #
       Example: "Demo Shoothouse 2"
    ------------------------------ */
    const namedSingle = part.match(/^([A-Za-z\s]+)\s+(\d+)$/);
    if (namedSingle) {
      const zone = namedSingle[1].trim();
      const n = namedSingle[2];
      results.push({
        booth_number: n,
        zone,
      });
      continue;
    }

    /* -----------------------------
       CASE 4: Pure numeric or alphanumeric
       Examples: "116", "108p", "207A"
    ------------------------------ */
    const numMatch = part.match(/^(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      results.push({
        booth_number: numMatch[0], // preserve "108p"
        zone: determineNumericZone(num),
      });
      continue;
    }

    /* -----------------------------
       CASE 5: Pure text (no #)
       Example: "Outdoor Demo"
    ------------------------------ */
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
   🔥 DETERMINE NUMERIC ZONE FOR NUMBER BOOTHS
   Example: 1910 → "1900–1999"
--------------------------------------------------------- */
function determineNumericZone(n: number): string {
  const base = Math.floor(n / 100) * 100;
  return `${base}–${base + 99}`;
}

/* -------------------------------------------------------
   🔥 ORIGINAL EXHIBITOR PARSER (unchanged)
--------------------------------------------------------- */
function parseHtmlToExhibitors(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const cards = Array.from(
    container.querySelectorAll('[class*="ExhibitorsStyles__exhibitor-card"]')
  ) as HTMLElement[];

  const exhibitors = cards
    .map((card) => {
      /* ---------- NAME ---------- */
      let name = "";
      const nameEl = card.querySelector(
        '[class*="ExhibitorsStyles__card-header"] [class*="placeholder"]'
      ) as HTMLElement | null;

      if (nameEl) {
        name = nameEl.textContent?.trim() || "";
      }

      if (!name) return null;

      /* ---------- RAW BOOTH STRING ---------- */
      let boothRaw: string | null = null;
      const locEl = card.querySelector(
        '[class*="ExhibitorsStyles__location-text"]'
      ) as HTMLElement | null;

      if (locEl) boothRaw = locEl.textContent?.trim() || null;

      /* ---------- CATEGORY ---------- */
      let category: string | null = null;
      const catEl = card.querySelector(
        '[class*="ExhibitorsStyles__categories"] span'
      ) as HTMLElement | null;

      if (catEl) category = catEl.textContent?.trim() || null;

      /* ---------- WEBSITE ---------- */
      let website: string | null = null;
      const linkEl = card.querySelector("a[href^='http']") as HTMLAnchorElement | null;
      if (linkEl) website = linkEl.getAttribute("href") || null;

      /* ---------- MULTIPLE BOOTH PARSING ---------- */
      const boothEntries = parseBoothString(boothRaw);

      return {
        name,
        category,
        website,
        boothEntries,
      };
    })
    .filter(Boolean) as {
    name: string;
    category: string | null;
    website: string | null;
    boothEntries: { booth_number: string; zone: string }[];
  }[];

  return exhibitors;
}

export default function ImportExhibitorsPage() {
  const [rawHtml, setRawHtml] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  /* -------------------------------------------------------
     🔥 IMPORT HANDLER (EXHIBITORS + BOOTHS)
  --------------------------------------------------------- */
  async function handleImport() {
    setStatus(null);

    if (!rawHtml.trim()) {
      setStatus("Paste HTML first.");
      return;
    }

    const exhibitors = parseHtmlToExhibitors(rawHtml);

    if (exhibitors.length === 0) {
      setStatus("No exhibitors found.");
      return;
    }

    // Dedupe exhibitors by name
    const exhibitorMap: Record<string, any> = {};
    exhibitors.forEach((ex) => {
      exhibitorMap[ex.name] = ex; // last one wins
    });

    const uniqueExhibitors = Object.values(exhibitorMap);

    setInserting(true);

    /* -------------------------------------------------------
       1. UPSERT EXHIBITORS
    --------------------------------------------------------- */
    const { data: upserted, error } = await supabase
      .from("exhibitors")
      .upsert(
        uniqueExhibitors.map((ex) => ({
          name: ex.name,
          category: ex.category,
          website: ex.website,
        })),
        { onConflict: "name" }
      )
      .select("id,name");

    if (error) {
      console.error(error);
      setStatus("Error inserting exhibitors: " + error.message);
      setInserting(false);
      return;
    }

    // Build lookup
    const idMap: Record<string, string> = {};
    upserted.forEach((row: any) => {
      idMap[row.name] = row.id;
    });

    /* -------------------------------------------------------
       2. CLEAN OLD BOOTHS
    --------------------------------------------------------- */
    await supabase.from("booths").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    /* -------------------------------------------------------
       3. INSERT NEW BOOTH RECORDS
    --------------------------------------------------------- */
    const boothPayload: any[] = [];

    for (const ex of uniqueExhibitors) {
      const exhibitor_id = idMap[ex.name];

      ex.boothEntries.forEach((b) => {
        boothPayload.push({
          exhibitor_id,
          booth_number: b.booth_number,
          zone: b.zone,
        });
      });
    }

    const { error: boothError } = await supabase.from("booths").insert(boothPayload);

    setInserting(false);

    if (boothError) {
      setStatus("Error inserting booths: " + boothError.message);
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
        className="w-full min-h-[250px] border rounded-lg p-3 font-mono"
        placeholder="Paste exhibitors HTML here..."
      />

      <button
        onClick={handleImport}
        disabled={inserting}
        className="bg-[#3b4522] text-white px-4 py-2 rounded-lg"
      >
        {inserting ? "Importing…" : "Import Exhibitors"}
      </button>

      {status && <p className="text-sm text-gray-800 mt-2">{status}</p>}
    </div>
  );
}