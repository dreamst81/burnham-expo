import { supabase } from "@/lib/supabaseClient";

export default async function EventsPage() {
  const { data: events } = await supabase.from("events").select("*");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Events</h1>
      <a
  href="/events/new"
  className="inline-block bg-[#3b4522] text-white px-4 py-2 rounded-lg hover:bg-[#2c341a]"
>
  + Add Event
</a>
      <ul className="space-y-4">
        {events?.map((event) => (
          <li
            key={event.id}
            className="bg-white p-4 rounded-xl shadow flex flex-col"
          >
            <span className="text-xl font-semibold">{event.name}</span>
            <span className="text-gray-600">
              {new Date(event.start_date).toLocaleDateString()} —{" "}
              {new Date(event.end_date).toLocaleDateString()}
            </span>
            {event.location && (
              <span className="text-gray-500">{event.location}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}