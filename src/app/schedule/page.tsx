"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  // 🔥 NEW: separate date + time fields
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [note, setNote] = useState("");

  // ---------------------------------
  // Pre-fill from query params (Exhibitor → Schedule)
  // ---------------------------------
  useEffect(() => {
    const presetTitle = searchParams.get("title");
    const presetLocation = searchParams.get("location");

    if (presetTitle) setTitle(presetTitle);
    if (presetLocation) setLocation(presetLocation);
  }, [searchParams]);

  // ---------------------------------
  // Load schedule items
  // ---------------------------------
  async function loadSchedule(user_id: string) {
    const { data, error } = await supabase
      .from("expo_schedules")
      .select("id,title,location,start_time,end_time,note")
      .eq("user_id", user_id)
      .eq("trade_show_id", MWW_TRADE_SHOW_ID)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setItems(data as ScheduleItem[]);
    } else if (error) {
      console.error("Error loading schedule:", error);
    }
  }

  // ---------------------------------
  // Initialize on page load
  // ---------------------------------
  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        router.push("/login");
        return;
      }

      setUserId(authData.user.id);
      await loadSchedule(authData.user.id);
      setLoading(false);
    }

    init();
  }, [router]);

  // ---------------------------------
  // Add new schedule item
  // ---------------------------------
  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    // Build start datetime
    if (!startDate || !startTime) {
      alert("Please select a start date and time.");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    if (Number.isNaN(startDateTime.getTime())) {
      alert("Invalid start date/time.");
      return;
    }

    // Build optional end datetime
    let endDateTime: Date | null = null;
    if (endDate && endTime) {
      const temp = new Date(`${endDate}T${endTime}`);
      if (!Number.isNaN(temp.getTime())) {
        endDateTime = temp;
      }
    }

    const { data, error } = await supabase
      .from("expo_schedules")
      .insert({
        user_id: userId,
        trade_show_id: MWW_TRADE_SHOW_ID,
        title,
        location: location || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime ? endDateTime.toISOString() : null,
        note: note || null,
      })
      .select("id,title,location,start_time,end_time,note")
      .single();

    if (error) {
      console.error(error);
      alert("Error adding item: " + error.message);
      return;
    }

    // Add and re-sort
    setItems((prev) =>
      [...prev, data as ScheduleItem].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    );

    // Clear form but keep title/location if they came from an exhibitor
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setNote("");
  }

  // ---------------------------------
  // Delete schedule item
  // ---------------------------------
  async function deleteItem(id: string) {
    const confirmed = confirm("Remove this from your schedule?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("expo_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error deleting item: " + error.message);
      return;
    }

    if (userId) loadSchedule(userId);
  }

  // ---------------------------------
  // Loading State
  // ---------------------------------
  if (loading) {
    return <div className="p-6 text-xl">Loading your schedule…</div>;
  }

  // ---------------------------------
  // UI
  // ---------------------------------
  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold">My Expo Schedule</h1>

      {/* List */}
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Items</h2>

        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing on your schedule yet. Add your first item below.
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

      {/* Add Item Form */}
      <form
        onSubmit={addItem}
        className="bg-white p-5 rounded-xl shadow space-y-4"
      >
        <h2 className="text-xl font-semibold">Add to My Schedule</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Visit Anduril booth"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location / Booth
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Booth 312, UAV West, Demo Day, etc."
            />
          </div>
        </div>

        {/* 🔥 New date/time fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Start Date &amp; Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              End Date &amp; Time (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Questions, objectives, who to meet…"
          />
        </div>

        <button
          type="submit"
          className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
        >
          Add to Schedule
        </button>
      </form>
    </div>
  );
}