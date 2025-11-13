"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditContactPage({ params }: any) {
  const router = useRouter();
  const { id } = use<{ id: string }>(params);

  const [events, setEvents] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [eventId, setEventId] = useState("");
  const [attended, setAttended] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from("events")
        .select("id, name");
      setEvents(eventData || []);

      const { data: contactData } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      setContact(contactData);
      setFirstName(contactData.first_name);
      setLastName(contactData.last_name);
      setEmail(contactData.email);
      setCompany(contactData.company);
      setEventId(contactData.event_id);
      setAttended(contactData.attended);
    }

    load();
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    await supabase
      .from("contacts")
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        company,
        event_id: eventId,
        attended,
      })
      .eq("id", id);

    router.push(`/contacts/${id}`);
    router.refresh();
  }

  if (!contact) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          className="w-full px-4 py-2 border rounded-lg"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="w-full px-4 py-2 border rounded-lg"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className="w-full px-4 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full px-4 py-2 border rounded-lg"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
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

        <button className="bg-[#3b4522] text-white px-4 py-2 rounded-lg">
          Save Changes
        </button>
      </form>

      <a href={`/contacts/${id}`} className="text-sm text-[#3b4522] underline">
        ← Back
      </a>
    </div>
  );
}