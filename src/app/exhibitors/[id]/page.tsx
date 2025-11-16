"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ExhibitorDetailPage({ params }: any) {
  const { id } = use<{ id: string }>(params);

  const [exhibitor, setExhibitor] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("exhibitors")
        .select("*")
        .eq("id", id)
        .single();

      setExhibitor(data);
    }
    load();
  }, [id]);

  const router = useRouter();
const [saving, setSaving] = useState(false);

async function addToSchedule() {
  const booth =
    exhibitor.booths?.[0]?.booth_number ||
    exhibitor.booths?.[0]?.zone ||
    "Expo Floor";

  const encodedTitle = encodeURIComponent(exhibitor.name);
  const encodedLocation = encodeURIComponent(booth);

  router.push(`/schedule?title=${encodedTitle}&location=${encodedLocation}`);
}

  async function togglePriority() {
    if (!exhibitor) return;
    const newValue = !exhibitor.priority;

    setExhibitor({ ...exhibitor, priority: newValue });

    await supabase
      .from("exhibitors")
      .update({ priority: newValue })
      .eq("id", id);
  }

  if (!exhibitor) return <div className="p-6">Loading exhibitor…</div>;


  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{exhibitor.name}</h1>

        <button
          onClick={togglePriority}
          className={`px-3 py-1 rounded-lg text-sm ${
            exhibitor.priority
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-gray-300 text-black hover:bg-gray-400"
          }`}
        >
          {exhibitor.priority ? "⭐ Priority Target" : "Mark as Priority"}
        </button>
      </div>

      <div className="bg-white p-6 shadow rounded-xl space-y-3">
        {exhibitor.booth && (
          <p>
            <span className="font-semibold">Booth:</span> {exhibitor.booth}
          </p>
        )}

        {exhibitor.website && (
          <p>
            <span className="font-semibold">Website:</span>{" "}
            <a
              href={exhibitor.website}
              target="_blank"
              rel="noreferrer"
              className="text-[#3b4522] underline"
            >
              {exhibitor.website}
            </a>
          </p>
        )}

        {exhibitor.tags && exhibitor.tags.length > 0 && (
          <p>
            <span className="font-semibold">Tags:</span>{" "}
            {exhibitor.tags.join(", ")}
          </p>
        )}
      </div>

      <button
  onClick={addToSchedule}
  disabled={saving}
  className="mt-6 bg-[#3b4522] text-white px-5 py-2 rounded-lg hover:bg-[#2c341a] disabled:opacity-50"
>
  {saving ? "Adding…" : "+ Add to My Schedule"}
</button>

<a
  href="/exhibitors"
  className="text-[#3b4522] underline block mt-4"
>
  ← Back to Exhibitors
</a>
    </div>
  );
}