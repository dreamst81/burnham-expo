"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const MWW_TRADE_SHOW_ID = "341ac0f3-82e0-484a-9809-ff512d6722a4";

type ScheduleItem = {
  id: string;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
};

export default function TodaySchedulePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get today's date boundaries
  function getTodayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  }

  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        router.push("/login");
        return;
      }

      const uid = authData.user.id;
      setUserId(uid);

      const { startISO, endISO } = getTodayRange();

      const { data, error } = await supabase
        .from("expo_schedules")
        .select("id,title,location,start_time,end_time,note")
        .eq("user_id", uid)
        .eq("trade_show_id", MWW_TRADE_SHOW_ID)
        .gte("start_time", startISO)
        .lt("start_time", endISO)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error loading today's schedule:", error);
      } else {
        setItems((data || []) as ScheduleItem[]);
      }

      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-xl">Loading today’s timeline…</div>;
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Today’s Timeline</h1>
      <p className="text-gray-600">{today}</p>

      {/* If empty */}
      {items.length === 0 && (
        <div className="bg-white p-5 rounded-xl shadow text-gray-500">
          No items for today yet. Add some from the Exhibitors page or your main schedule.
        </div>
      )}

      {/* Timeline */}
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="bg-white border rounded-xl p-5 shadow flex flex-col space-y-2"
          >
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{item.title}</h2>
            </div>

            <div className="text-sm text-gray-600">
              {new Date(item.start_time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
              {item.end_time &&
                ` – ${new Date(item.end_time).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
            </div>

            {item.location && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Location:</span> {item.location}
              </div>
            )}

            {item.note && (
              <div className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Notes:</span> {item.note}
              </div>
            )}
          </li>
        ))}
      </ul>

      <a href="/schedule" className="text-[#3b4522] underline">
        ← Back to My Schedule
      </a>
    </div>
  );
}