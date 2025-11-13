"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("exhibitors")
        .select("*")
        .order("name", { ascending: true });

      setExhibitors(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-xl">Loading exhibitors…</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exhibitors</h1>

        <a
          href="/exhibitors/import"
          className="inline-block bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
        >
          Import from HTML
        </a>
      </div>

      <ul className="space-y-3">
        {exhibitors.map((ex) => (
          <li
            key={ex.id}
            className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
            onClick={() => (window.location.href = `/exhibitors/${ex.id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{ex.name}</p>
                {ex.booth && (
                  <p className="text-gray-600 text-sm">Booth {ex.booth}</p>
                )}
                {ex.website && (
                  <p className="text-gray-500 text-sm">
                    {ex.website.replace(/^https?:\/\//, "")}
                  </p>
                )}
              </div>

              {ex.priority && (
                <span className="px-2 py-1 rounded-full bg-yellow-300 text-yellow-900 text-xs font-semibold">
                  ⭐ Priority
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}