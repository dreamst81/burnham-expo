"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactDetailPage({ params }: any) {
  const { id } = use<{ id: string }>(params);

  const [contact, setContact] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    async function load() {
      // Load contact
      const { data: contactData } = await supabase
        .from("contacts")
        .select(`
          *,
          events(name, start_date, end_date, location)
        `)
        .eq("id", id)
        .single();

      setContact(contactData);
      setNotes(contactData.notes || "");
      setPriority(contactData.priority || false);

      // Load timeline
      const { data: notesData } = await supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: false });

      setTimeline(notesData || []);
    }

    load();
  }, [id]);

  async function saveNotes() {
    await supabase.from("contacts").update({ notes }).eq("id", id);
    alert("Notes saved");
  }

  async function togglePriority() {
    const newValue = !priority;
    setPriority(newValue);
    await supabase.from("contacts").update({ priority: newValue }).eq("id", id);
    // location.reload(); // Optional
  }

  async function addNote() {
    if (!newNote.trim()) return;

    await supabase.from("contact_notes").insert({
      contact_id: id,
      note: newNote,
    });

    setNewNote("");

    const { data } = await supabase
      .from("contact_notes")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false });

    setTimeline(data || []);
  }

  if (!contact) return <div className="p-6">Loading…</div>;

  return (
    <>
      {/* Contact + Notes */}
      <div className="space-y-6 max-w-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {contact.first_name} {contact.last_name}
          </h1>

          <button
            onClick={togglePriority}
            className={`px-3 py-1 rounded-lg text-sm ${
              priority
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-gray-300 text-black hover:bg-gray-400"
            }`}
          >
            {priority ? "⭐ Priority Lead" : "Mark as Priority"}
          </button>
        </div>

        <div className="bg-white p-6 shadow rounded-xl space-y-4">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Company:</span> {contact.company}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Email:</span> {contact.email}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Status:</span>{" "}
            {contact.attended ? "Attended" : "Registered"}
          </p>

          <hr />

          {contact.events && (
            <div>
              <p className="text-xl font-semibold mb-2">Event</p>
              <p className="text-gray-800">{contact.events.name}</p>
              <p className="text-gray-600">
                {new Date(contact.events.start_date).toLocaleDateString()} –{" "}
                {new Date(contact.events.end_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{contact.events.location}</p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white p-6 shadow rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">Profile Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg min-h-[120px]"
          />
          <button
            onClick={saveNotes}
            className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
          >
            Save Notes
          </button>
        </div>

        <a
          href={`/contacts/${contact.id}/edit`}
          className="inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          Edit Contact
        </a>

        <a
          href="/contacts"
          className="inline-block text-sm text-[#3b4522] underline"
        >
          ← Back
        </a>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4 max-w-xl mt-8">
        <h2 className="text-xl font-semibold">Timeline</h2>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={addNote}
            className="bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
          >
            Add
          </button>
        </div>

        <hr />

        <ul className="space-y-4">
          {timeline.map((item) => (
            <li
              key={item.id}
              className="border-l-4 border-[#3b4522] pl-4 py-2"
            >
              <p className="text-gray-800">{item.note}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}