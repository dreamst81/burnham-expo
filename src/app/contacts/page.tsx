"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load events
      const { data: eventData } = await supabase
        .from("events")
        .select("id, name");

      // Load contacts (joined with events)
      const { data: contactData } = await supabase
        .from("contacts")
        .select(`
          id,
          first_name,
          last_name,
          email,
          company,
          attended,
          event_id,
          events(name)
        `);

      setEvents(eventData || []);
      setContacts(contactData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  // Filter Logic
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      `${c.first_name} ${c.last_name} ${c.company} ${c.email}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesEvent =
      selectedEvent === "all" || c.event_id === selectedEvent;

    return matchesSearch && matchesEvent;
  });

  if (loading) {
    return <div className="p-6 text-xl">Loading contacts…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contacts</h1>

      {/* 🔍 Search + Event Filter */}
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-1/2 rounded-lg border border-gray-300"
        />

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300"
        >
          <option value="all">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔁 Contacts List */}
      <ul className="space-y-4">
        {filteredContacts.map((contact) => (
          <li key={contact.id}>
  <a
    href={`/contacts/${contact.id}`}
    className="block bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all flex flex-col"
  >
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">
                {contact.first_name} {contact.last_name}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  contact.attended
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {contact.attended ? "Attended" : "Registered"}
              </span>
            </div>

            <span className="text-gray-700">{contact.company}</span>
            <span className="text-gray-500">{contact.email}</span>

            {contact.events && (
              <span className="text-gray-600 mt-2">
                Event: {contact.events.name}
              </span>
            )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}