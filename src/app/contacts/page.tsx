"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);

  async function loadData() {
    // Load events
    const { data: eventData } = await supabase
      .from("events")
      .select("id, name");

    // Load contacts with joined event
    const { data: contactData } = await supabase
  .from("contacts")
  .select(`
    id,
    first_name,
    last_name,
    email,
    company,
    attended,
    priority,
    notes,
    event_id,
    events(name)
  `);

    setEvents(eventData || []);
    setContacts(contactData || []);
    setLoading(false);
  }

  // DELETE CONTACT
  async function deleteContact(id: string) {
    const yes = confirm("Are you sure you want to delete this contact?");
    if (!yes) return;

    await supabase.from("contacts").delete().eq("id", id);

    loadData(); // refresh list immediately
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search Logic
  const filteredContacts = contacts.filter((c) => {
  const matchesSearch =
    `${c.first_name} ${c.last_name} ${c.company} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesEvent =
    selectedEvent === "all" || c.event_id === selectedEvent;

  const matchesPriority =
    !showPriorityOnly || c.priority === true;

  return matchesSearch && matchesEvent && matchesPriority;
});

  if (loading) {
    return <div className="p-6 text-xl">Loading contacts…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contacts</h1>

        <a
          href="/contacts/new"
          className="inline-block bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
        >
          + Add Contact
        </a>
      </div>

      <div className="flex space-x-4 items-center">
  {/* Search */}
  <input
    type="text"
    placeholder="Search contacts…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="px-4 py-2 w-1/3 rounded-lg border border-gray-300"
  />

  {/* Event Filter */}
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

  {/* Priority Lead Filter */}
  <label className="flex items-center space-x-2 text-gray-700">
    <input
      type="checkbox"
      checked={showPriorityOnly}
      onChange={(e) => setShowPriorityOnly(e.target.checked)}
    />
    <span>Priority Only</span>
  </label>
</div>

      {/* Contacts List */}
      <ul className="space-y-4">
        {filteredContacts.map((contact) => (
          <li
            key={contact.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-start"
          >
            <a
              href={`/contacts/${contact.id}`}
              className="flex flex-col flex-1 hover:opacity-90"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">
                  {contact.first_name} {contact.last_name}
                </span>
                {contact.priority && (
  <span className="ml-2 inline-block px-2 py-1 bg-yellow-300 text-yellow-900 text-xs font-semibold rounded">
    ⭐ Priority
  </span>
)}
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

            {/* Delete Button */}
            <button
              onClick={() => deleteContact(contact.id)}
              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm ml-4"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}