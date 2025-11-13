"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewContactPage() {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [eventId, setEventId] = useState("");
  const [attended, setAttended] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from("events").select("*");
      setEvents(data || []);
    }
    loadEvents();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const { error } = await supabase.from("contacts").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      company,
      event_id: eventId,
      attended,
    });

    if (!error) {
      router.push("/contacts");
      router.refresh();
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Add Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />

        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={attended}
            onChange={(e) => setAttended(e.target.checked)}
          />
          <span>Attended this event</span>
        </label>

        <button className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]">
          Save Contact
        </button>
      </form>

      <a href="/contacts" className="text-sm text-[#3b4522] underline">
        ← Back to Contacts
      </a>
    </div>
  );
}