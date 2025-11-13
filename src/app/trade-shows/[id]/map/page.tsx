"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Booth = {
  id: string;
  booth_number: string;
  zone: string;
  exhibitors: {
    name: string;
  } | null;
};

export default function TradeShowMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap Next.js route params the new way
  const { id: tradeShowId } = use(params);

  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD BOOTHS FOR THIS TRADE SHOW
  --------------------------------------------------------- */
  useEffect(() => {
  async function load() {
    const { data, error } = await supabase
      .from("booths")
      .select(`
        id,
        booth_number,
        zone,
        exhibitors (
          name
        )
      `)
      .eq("trade_show_id", tradeShowId)
      .order("zone", { ascending: true })
      .order("booth_number", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    // Normalize: Supabase returns exhibitors as an array
    const normalized = (data || []).map((row: any) => ({
      ...row,
      exhibitors:
        Array.isArray(row.exhibitors) && row.exhibitors.length > 0
          ? row.exhibitors[0]
          : null,
    }));

    setBooths(normalized as Booth[]);
    setLoading(false);
  }

  load();
}, [tradeShowId]);

  if (loading) {
    return <div className="p-6 text-xl">Loading booth map…</div>;
  }

  /* -------------------------------------------------------
     GROUP BY ZONE
  --------------------------------------------------------- */
  const zoneGroups: Record<string, Booth[]> = {};

  booths.forEach((b) => {
    if (!zoneGroups[b.zone]) zoneGroups[b.zone] = [];
    zoneGroups[b.zone].push(b);
  });

  const zones = Object.keys(zoneGroups).sort((a, b) => {
    // Numeric zones sort by their base number
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

    // Named zones sort alphabetically after numeric zones
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;

    return a.localeCompare(b);
  });

  /* -------------------------------------------------------
     STYLING HELPERS
  --------------------------------------------------------- */
  function zoneTitle(zone: string) {
    // Numeric zones come through as "100–199"
    if (/^\d+–\d+$/.test(zone)) {
      return zone;
    }
    return zone; // Named zones unchanged
  }

  /* -------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Exhibitor Map</h1>

      {zones.map((zone) => (
        <div key={zone} className="space-y-4">
          {/* Zone Header */}
          <h2 className="text-2xl font-semibold border-b pb-1">
            {zoneTitle(zone)}
          </h2>

          {/* Booth Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneGroups[zone].map((booth) => (
              <div
                key={booth.id}
                className="border rounded-xl p-4 bg-white shadow hover:shadow-md transition"
              >
                <div className="text-sm text-gray-500 mb-1">
                  Booth {booth.booth_number}
                </div>

                <div className="font-semibold text-lg">
                  {booth.exhibitors?.name ?? "Unknown Exhibitor"}
                </div>

                {/* Could add sub-links later like “View profile”, etc. */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}