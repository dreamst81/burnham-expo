"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents(data || []);
    setLoading(false);
  }

  async function deleteEvent(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    await supabase.from("events").delete().eq("id", id);

    // Refresh list
    loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return <div className="p-6 text-xl">Loading events…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>

        <a
          href="/events/new"
          className="inline-block bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
        >
          + Add Event
        </a>
      </div>

      <ul className="space-y-4">
        {events.map((event) => (
          <li
  key={event.id}
  className="relative bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer"
  onClick={() => (window.location.href = `/events/${event.id}`)}
>
  {/* Main content */}
  <div className="flex justify-between items-start">
    <div className="flex flex-col">
      <span className="text-xl font-semibold">{event.name}</span>
      <span className="text-gray-600">
        {new Date(event.start_date).toLocaleDateString()} —{" "}
        {new Date(event.end_date).toLocaleDateString()}
      </span>
      {event.location && (
        <span className="text-gray-500">{event.location}</span>
      )}
    </div>

    {/* Buttons */}
    <div className="flex space-x-2 z-10">
      <a
        href={`/events/${event.id}/edit`}
        onClick={(e) => e.stopPropagation()} // prevent row click
        className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-800 text-sm"
      >
        Edit
      </a>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent row click
          deleteEvent(event.id);
        }}
        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm"
      >
        Delete
      </button>
    </div>
  </div>
</li>
        ))}
      </ul>
    </div>
  );
}