"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ImportExhibitorsPage() {
  const [rawHtml, setRawHtml] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  function parseHtmlToExhibitors(html: string) {
    const container = document.createElement("div");
    container.innerHTML = html;

    // Select all exhibitor cards from the pasted HTML
    const cards = Array.from(
      container.querySelectorAll('[class*="ExhibitorsStyles__exhibitor-card"]')
    ) as HTMLElement[];

    console.log("Found cards:", cards.length);

    const exhibitors = cards
      .map((card) => {
        // ---- NAME ----
        let name = "";
        const nameEl = card.querySelector(
          '[class*="ExhibitorsStyles__card-header"] [class*="placeholder"]'
        ) as HTMLElement | null;

        if (nameEl) {
          name = nameEl.textContent?.trim() || "";
        }

        // If name still empty, fallback to first text line
        if (!name) {
          const txt = (card.textContent || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          name = txt[0] || "";
        }

        // ---- BOOTH / LOCATION ----
        let booth = "";
        const locEl = card.querySelector(
          '[class*="ExhibitorsStyles__location-text"]'
        ) as HTMLElement | null;

        if (locEl) {
          booth = locEl.textContent?.trim() || "";
        }

        // ---- CATEGORY ----
        let category = "";
        const catEl = card.querySelector(
          '[class*="ExhibitorsStyles__categories"] span'
        ) as HTMLElement | null;

        if (catEl) {
          category = catEl.textContent?.trim() || "";
        }

        // ---- WEBSITE (if present) ----
        let website = "";
        const linkEl = card.querySelector("a[href^='http']") as HTMLAnchorElement | null;

        if (linkEl) {
          website = linkEl.getAttribute("href") || "";
        }

        // Skip bad cards
        if (!name || name.length < 1) return null;

        return {
          name,
          booth: booth || null,
          category: category || null,
          website: website || null,
        };
      })
      .filter(Boolean) as {
        name: string;
        booth: string | null;
        category: string | null;
        website: string | null;
      }[];

    console.log("Parsed exhibitors:", exhibitors);

    return exhibitors;
  }

  async function handleImport() {
    setStatus(null);

    if (!rawHtml.trim()) {
      setStatus("Paste the HTML from the exhibitors page first.");
      return;
    }

    const exhibitors = parseHtmlToExhibitors(rawHtml);

    if (!exhibitors || exhibitors.length === 0) {
      setStatus("No exhibitors found. We may need to tweak the parser again.");
      return;
    }

    setInserting(true);

    const { error } = await supabase
      .from("exhibitors")
      .upsert(exhibitors, { onConflict: "name" });

    setInserting(false);

    if (error) {
      console.error(error);
      setStatus("Error inserting exhibitors: " + error.message);
    } else {
      setStatus(`Imported ${exhibitors.length} exhibitors successfully.`);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Import Exhibitors</h1>

      <p className="text-gray-700">
        Paste the HTML snippet from the Modern Warfare Week exhibitors list
        into the box below, then click <strong>Import</strong>.
      </p>

      <textarea
        value={rawHtml}
        onChange={(e) => setRawHtml(e.target.value)}
        className="w-full min-h-[250px] border rounded-lg p-3 font-mono text-sm"
        placeholder="Paste the exhibitors HTML here…"
      />

      <button
        onClick={handleImport}
        disabled={inserting}
        className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a] disabled:opacity-50"
      >
        {inserting ? "Importing…" : "Import Exhibitors"}
      </button>

      {status && <p className="text-sm text-gray-800 mt-2">{status}</p>}

      <a href="/exhibitors" className="text-[#3b4522] underline block mt-4">
        ← Back to Exhibitors
      </a>
    </div>
  );
}