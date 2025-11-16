"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [priorityLeads, setPriorityLeads] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [intel, setIntel] = useState<string>("");

  useEffect(() => {
    async function load() {
      // Load events
      const { data: eventData } = await supabase.from("events").select("*");
      setEvents(eventData || []);

      // Load contacts
      const { data: contactData } = await supabase.from("contacts").select("*");
      setContacts(contactData || []);

      // Priority leads
      const priority = (contactData || []).filter((c) => c.priority === true);
      setPriorityLeads(priority);

      // Recent activity (timeline notes)
      const { data: timeline } = await supabase
        .from("contact_notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(timeline || []);
    }

    load();
  }, []);

  async function generateDashboardIntel() {
    setIntel("Generating intel…");

    const prompt = `
Burnham Dashboard Intel:
Events: ${events.length}
Contacts: ${contacts.length}
Priority Leads: ${priorityLeads.length}

Events List:
${events.map((ev) => `- ${ev.name} (${ev.start_date} to ${ev.end_date})`).join("\n")}

Priority Leads List:
${priorityLeads.map((c) => `- ${c.first_name} ${c.last_name} (${c.company})`).join("\n")}

Recent Activity:
${recentActivity.map((n) => `- ${n.note}`).join("\n")}

Provide:
- High-level situational summary
- Which events need the most attention
- Biggest opportunities
- Risks or blind spots
- Recommended next moves for Dan and Niño
- Keep it under 6 bullet points
`;

    const response = await fetch("/api/eventIntel", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    setIntel(data.output);
  }

  return (
    <div className="space-y-10 max-w-4xl">

      <div className="flex justify-center items-end mb-10">
          <Image
            src="/edm-expo-logo.jpg"
            alt="Burnham Expo Logo"
            width={400}
            height={218}
            className="object-contain"
            priority
          />
        </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4">
          <a
            href="/events/new"
            className="bg-[#3b4522] text-white p-4 rounded-lg text-center hover:bg-[#2c341a]"
          >
            + Add Event
          </a>

          <a
            href="/contacts/new"
            className="bg-[#3b4522] text-white p-4 rounded-lg text-center hover:bg-[#2c341a]"
          >
            + Add Contact
          </a>

          <a
            href="/priority"
            className="bg-gray-700 text-white p-4 rounded-lg text-center hover:bg-gray-800"
          >
            Priority Leads
          </a>

          <a
            href="/users"
            className="bg-gray-700 text-white p-4 rounded-lg text-center hover:bg-gray-800"
          >
            Manage Users
          </a>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>

        <ul className="space-y-4">
          {events.length === 0 && <p>No events yet.</p>}
          {events.map((ev) => (
            <li
              key={ev.id}
              className="border p-4 rounded-lg flex justify-between items-center hover:shadow cursor-pointer transition"
              onClick={() => (window.location.href = `/events/${ev.id}`)}
            >
              <div>
                <p className="text-lg font-semibold">{ev.name}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(ev.start_date).toLocaleDateString()} –{" "}
                  {new Date(ev.end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p>{contacts.filter((c) => c.event_id === ev.id).length} attendees</p>
                <p className="text-yellow-600">
                  {contacts.filter((c) => c.event_id === ev.id && c.priority).length} priority
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Priority Leads */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">
          Priority Leads ({priorityLeads.length})
        </h2>

        <ul className="space-y-3">
          {priorityLeads.map((c) => (
            <li
              key={c.id}
              className="border-l-4 border-yellow-400 pl-4 cursor-pointer"
              onClick={() => (window.location.href = `/contacts/${c.id}`)}
            >
              <p className="font-medium">
                {c.first_name} {c.last_name} — {c.company}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>

        <ul className="space-y-3">
          {recentActivity.map((n) => (
            <li key={n.id} className="border-b pb-2">
              <span className="font-semibold text-[#3b4522]">
                {new Date(n.created_at).toLocaleDateString()}:
              </span>{" "}
              {n.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}