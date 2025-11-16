"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const MWW_TRADE_SHOW_ID = "341ac0f3-82e0-484a-9809-ff512d6722a4";

type ScheduleItem = {
  id: string;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
};

export default function MySchedulePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        router.push("/login");
        return;
      }

      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from("expo_schedules")
        .select("id,title,location,start_time,end_time,note")
        .eq("user_id", authData.user.id)
        .eq("trade_show_id", MWW_TRADE_SHOW_ID)
        .order("start_time", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setItems((data || []) as ScheduleItem[]);
      setLoading(false);
    }

    init();
  }, [router]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    const { data, error } = await supabase
      .from("expo_schedules")
      .insert({
        user_id: userId,
        trade_show_id: MWW_TRADE_SHOW_ID,
        title,
        location: location || null,
        start_time: startTime,
        end_time: endTime || null,
        note: note || null,
      })
      .select("id,title,location,start_time,end_time,note")
      .single();

    if (error) {
      console.error(error);
      alert("Error adding item: " + error.message);
      return;
    }

    setItems((prev) => [...prev, data as ScheduleItem].sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    ));

    // reset form
    setTitle("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setNote("");
  }

  async function deleteItem(id: string) {
    const ok = confirm("Remove this from your schedule?");
    if (!ok) return;

    const { error } = await supabase
      .from("expo_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error deleting item: " + error.message);
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return <div className="p-6 text-xl">Loading your schedule…</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold">My Expo Schedule</h1>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Add to My Schedule</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Visit Anduril booth, Meeting w/ SOF rep"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location / Booth</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Booth 312, UAV West, Demo Day, etc."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time (optional)</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Questions to ask, who to look for, objectives…"
          />
        </div>

        <button
          type="submit"
          className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
        >
          Add to Schedule
        </button>
      </form>

      {/* List */}
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Items</h2>

        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing on your schedule yet. Add your first item above.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="border rounded-lg px-4 py-3 flex justify-between items-start"
              >
                <div className="space-y-1">
                  <div className="font-semibold">{item.title}</div>
                  {item.location && (
                    <div className="text-sm text-gray-600">
                      Location: {item.location}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(item.start_time).toLocaleString()}
                    {item.end_time &&
                      ` – ${new Date(item.end_time).toLocaleString()}`}
                  </div>
                  {item.note && (
                    <div className="text-sm text-gray-700 mt-1">
                      {item.note}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}