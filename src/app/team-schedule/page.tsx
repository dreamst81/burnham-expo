"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const MWW_TRADE_SHOW_ID = "341ac0f3-82e0-484a-9809-ff512d6722a4";

type TeamScheduleItem = {
  id: string;
  user_id: string;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
};

export default function TeamSchedulePage() {
  const router = useRouter();
  const [itemsByUser, setItemsByUser] = useState<
    Record<string, TeamScheduleItem[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("expo_schedules")
        .select("id,user_id,title,location,start_time,end_time,note")
        .eq("trade_show_id", MWW_TRADE_SHOW_ID)
        .order("start_time", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const grouped: Record<string, TeamScheduleItem[]> = {};
      (data || []).forEach((row) => {
        const r = row as TeamScheduleItem;
        if (!grouped[r.user_id]) grouped[r.user_id] = [];
        grouped[r.user_id].push(r);
      });

      setItemsByUser(grouped);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-xl">Loading team schedule…</div>;
  }

  const userIds = Object.keys(itemsByUser);

  return (
    <div className="space-y-8 max-w-5xl">
      <h1 className="text-3xl font-bold">Team Schedule</h1>
      <p className="text-gray-600 text-sm">
        Everyone&apos;s plan for Modern Warfare Week. Use this to coordinate who is
        where and when.
      </p>

      {userIds.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No schedule entries yet. Once you and the team start adding items,
          they&apos;ll show up here.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {userIds.map((uid) => {
            const items = itemsByUser[uid].slice().sort((a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
            );

            return (
              <div
                key={uid}
                className="bg-white rounded-xl shadow p-5 space-y-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    User: {uid.slice(0, 8)}…
                  </h2>
                  {/* Later: we can map user_id -> "Dan", "Niño" via a profiles table */}
                </div>

                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="border rounded-lg px-3 py-2 space-y-1"
                    >
                      <div className="font-semibold text-sm">
                        {item.title}
                      </div>
                      {item.location && (
                        <div className="text-xs text-gray-600">
                          {item.location}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500">
                        {new Date(item.start_time).toLocaleString()}
                        {item.end_time &&
                          ` – ${new Date(item.end_time).toLocaleString()}`}
                      </div>
                      {item.note && (
                        <div className="text-xs text-gray-700">
                          {item.note}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}