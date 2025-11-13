"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";


export default function EventDetailPage({ params }: any) {
  const { id } = use<{ id: string }>(params);

  const [eventData, setEventData] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [priorityLeads, setPriorityLeads] = useState<any[]>([]);
  const [aiIntel, setAiIntel] = useState<string>("");

  useEffect(() => {
    async function load() {
      // Load event
      const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      setEventData(event);

      // Load attendees
      const { data: attendeeData } = await supabase
        .from("contacts")
        .select("*")
        .eq("event_id", id);

      setAttendees(attendeeData || []);

      // Priority-only list
      const priority = (attendeeData || []).filter(
        (c) => c.priority === true
      );

      setPriorityLeads(priority);
    }

    load();
  }, [id]);

  async function generateIntel() {
    setAiIntel("Generating intel…");

    const prompt = `
Event Name: ${eventData.name}
Dates: ${eventData.start_date} – ${eventData.end_date}
Location: ${eventData.location}

Total Attendees: ${attendees.length}
Priority Leads: ${priorityLeads.length}

Attendees:
${attendees
  .map((c) => `- ${c.first_name} ${c.last_name} (${c.company})`)
  .join("\n")}

Priority Leads:
${priorityLeads
  .map((c) => `- ${c.first_name} ${c.last_name} (${c.company})`)
  .join("\n")}

Provide:
1. A quick situational summary
2. The top opportunities at this event
3. Action items and recommended follow-up for Dan
4. Any strategic risks or weaknesses worth noting
5. Your analysis in 4–6 tight bullet points
    `;

    const response = await fetch("/api/eventIntel", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    setAiIntel(data.output);
  }

  if (!eventData) return <div className="p-6">Loading event…</div>;

  return (
    <div className="max-w-3xl space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{eventData.name}</h1>
        <Link
          href={`/events/${id}/edit`}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          Edit Event
        </Link>
      </div>

      {/* Event Info */}
      <div className="bg-white p-6 shadow rounded-xl space-y-3">
        <p>
          <span className="font-semibold">Dates:</span>{" "}
          {new Date(eventData.start_date).toLocaleDateString()} –{" "}
          {new Date(eventData.end_date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Location:</span>{" "}
          {eventData.location}
        </p>

        {eventData.description && (
          <p className="text-gray-700">{eventData.description}</p>
        )}
      </div>

      {/* AI Intel Panel */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">AI Intel</h2>
          <button
            onClick={generateIntel}
            className="px-4 py-2 bg-[#3b4522] text-white rounded-lg hover:bg-[#2c341a]"
          >
            Generate Intel
          </button>
        </div>

        <div className="border p-4 rounded-lg bg-gray-50 whitespace-pre-wrap">
          {aiIntel ? aiIntel : "Click Generate Intel to analyze this event"}
        </div>
      </div>

      {/* Priority Leads */}
      <div className="bg-white p-6 shadow rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">
          Priority Leads ({priorityLeads.length})
        </h2>

        <ul className="space-y-3">
          {priorityLeads.map((c) => (
            <li
              key={c.id}
              className="border-l-4 border-yellow-400 pl-4 py-2"
            >
              <Link
                href={`/contacts/${c.id}`}
                className="text-lg font-medium text-[#3b4522] hover:underline"
              >
                {c.first_name} {c.last_name}
              </Link>
              <p className="text-gray-600 text-sm">{c.company}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* All Attendees */}
      <div className="bg-white p-6 shadow rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">
          All Attendees ({attendees.length})
        </h2>

        <ul className="space-y-3">
          {attendees.map((c) => (
            <li key={c.id} className="border-b pb-2">
              <Link
                href={`/contacts/${c.id}`}
                className="text-lg font-medium text-[#3b4522] hover:underline"
              >
                {c.first_name} {c.last_name}
              </Link>
              <p className="text-gray-600 text-sm">{c.company}</p>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/events" className="text-[#3b4522] underline">
        ← Back to Events
      </Link>
    </div>
  );
}