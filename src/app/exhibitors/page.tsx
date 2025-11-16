"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Booth = {
  booth_number: string;
  zone: string;
};

type Exhibitor = {
  id: string;
  name: string;
  category: string | null;
  website: string | null;
  booths: Booth[];
};

export default function ExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("exhibitors")
        .select(`
          id,
          name,
          category,
          website,
          booths:booths!exhibitor_id (
            booth_number,
            zone
          )
        `)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading exhibitors:", error);
        setLoading(false);
        return;
      }

      // Normalize booths array
      const normalized = (data || []).map((ex: any) => ({
        ...ex,
        booths: Array.isArray(ex.booths) ? ex.booths : [],
      }));

      setExhibitors(normalized as Exhibitor[]);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-xl">Loading exhibitors…</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold mb-4">Exhibitors</h1>

      <a
        href="/exhibitors/import"
        className="inline-block bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
      >
        + Import Exhibitors (HTML)
      </a>

      <ul className="space-y-6">
        {exhibitors.map((ex) => (
          <li key={ex.id}>
            <a
              href={`/exhibitors/${ex.id}`}
              className="block bg-white p-5 rounded-xl shadow border hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{ex.name}</h2>
                  {ex.category && (
                    <p className="text-gray-600 text-sm mt-1">{ex.category}</p>
                  )}
                </div>

                {ex.website && (
                  <a
                    href={ex.website}
                    target="_blank"
                    className="text-sm text-blue-600 underline"
                  >
                    Website
                  </a>
                )}
              </div>

              {/* Booths */}
              <div className="mt-4">
                <p className="font-medium text-gray-700 mb-2">
                  Booth Locations:
                </p>

                {ex.booths.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ex.booths.map((b, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                      >
                        <div className="text-sm text-gray-500">Booth</div>
                        <div className="font-semibold">{b.booth_number}</div>

                        <div className="text-xs text-gray-400 mt-1">
                          Zone: {b.zone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No booth assigned</p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}