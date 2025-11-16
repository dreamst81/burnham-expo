"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const MWW_TRADE_SHOW_ID = "341ac0f3-82e0-484a-9809-ff512d6722a4";

type Profile = {
  user_id: string;
  full_name: string | null;
};

type TeamScheduleItem = {
  id: string;
  user_id: string;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
  exhibitors: { name: string }[] | null;
};

export default function TeamSchedulePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [itemsByUser, setItemsByUser] = useState<
    Record<string, TeamScheduleItem[]>
  >({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    async function load() {
      // 1) USER CHECK
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }

      // 2) LOAD ALL SCHEDULE ITEMS (NO JOIN)
      const { data: schedules, error: schedErr } = await supabase
        .from("expo_schedules")
        .select(
          `
          id,
          user_id,
          title,
          location,
          start_time,
          end_time,
          note,
          exhibitors(name)
        `
        )
        .eq("trade_show_id", MWW_TRADE_SHOW_ID)
        .order("start_time");

      if (schedErr) {
        console.error(schedErr);
        setLoading(false);
        return;
      }

      const grouped: Record<string, TeamScheduleItem[]> = {};
      (schedules || []).forEach((row) => {
        if (!grouped[row.user_id]) grouped[row.user_id] = [];
        grouped[row.user_id].push(row as TeamScheduleItem);
      });

      setItemsByUser(grouped);

      // 3) LOAD ALL PROFILES SEPARATELY
      const { data: profileRows, error: profileErr } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (profileErr) {
        console.error(profileErr);
      }

      const profileMap: Record<string, Profile> = {};
      (profileRows || []).forEach((p: Profile) => {
        profileMap[p.user_id] = p;
      });

      setProfiles(profileMap);

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-xl">Loading team schedule…</div>;
  }

  const userIds = Object.keys(itemsByUser);

  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="text-3xl font-bold">Team Schedule</h1>
      <p className="text-gray-600 text-sm">
        Everyone’s Modern Warfare Week plan — clean, color-coded, and reliable.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {userIds.map((uid, idx) => {
          const colors = [
            {
              border: "border-emerald-700",
              bg: "bg-emerald-50",
              tagBg: "bg-emerald-700",
            },
            {
              border: "border-sky-700",
              bg: "bg-sky-50",
              tagBg: "bg-sky-700",
            },
            {
              border: "border-amber-700",
              bg: "bg-amber-50",
              tagBg: "bg-amber-700",
            },
            {
              border: "border-violet-700",
              bg: "bg-violet-50",
              tagBg: "bg-violet-700",
            },
          ][idx % 4];

          const items = itemsByUser[uid];

          const displayName =
            profiles[uid]?.full_name ?? `User ${uid.slice(0, 8)}…`;

          const initials =
            displayName
              .split(" ")
              .map((p) => p[0]?.toUpperCase())
              .join("")
              .slice(0, 2) || "U";

          // Group by day
          const byDay: Record<string, TeamScheduleItem[]> = {};
          items.forEach((item) => {
            const key = new Date(item.start_time).toDateString();
            if (!byDay[key]) byDay[key] = [];
            byDay[key].push(item);
          });

          const dayKeys = Object.keys(byDay).sort(
            (a, b) =>
              new Date(a).getTime() - new Date(b).getTime()
          );

          return (
            <div
              key={uid}
              className={`border ${colors.border} rounded-2xl bg-white shadow overflow-hidden`}
            >
              <div className="px-4 py-3 border-b bg-slate-50 flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white ${colors.tagBg}`}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{displayName}</div>
                  <div className="text-[11px] text-gray-500">
                    Modern Warfare Week
                  </div>
                </div>
              </div>

              <div className={`p-4 space-y-4 ${colors.bg}`}>
                {dayKeys.map((day) => (
                  <div key={day} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 uppercase">
                      {day}
                    </div>

                    {byDay[day].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow px-3 py-2 border"
                      >
                        <div className="font-semibold text-sm">
                          {item.title}
                        </div>

                        {item.location && (
                          <div className="text-xs text-gray-600">
                            {item.location}
                          </div>
                        )}

                        {item.exhibitors?.[0]?.name && (
                          <div className="text-[11px] text-emerald-700">
                            Exhibitor: {item.exhibitors[0].name}
                          </div>
                        )}

                        <div className="text-[11px] text-gray-500">
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

                        {item.note && (
                          <div className="text-xs text-gray-700">
                            {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}