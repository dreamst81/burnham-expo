"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    const { error } = await supabase.from("events").insert({
      name,
      start_date: startDate,
      end_date: endDate,
      location,
      description,
    });

    if (!error) {
      router.push("/events");
      router.refresh();
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Add Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          type="text"
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-1/2 px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-1/2 px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <input
          type="text"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />

        <button className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]">
          Save Event
        </button>
      </form>

      <a href="/events" className="text-sm text-[#3b4522] underline">
        ← Back to Events
      </a>
    </div>
  );
}