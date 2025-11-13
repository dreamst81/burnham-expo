import { supabase } from "@/lib/supabaseClient";

export default async function ContactDetailPage({ params }: any) {
  const id = params.id;

  const { data: contact, error } = await supabase
    .from("contacts")
    .select(`
      id,
      first_name,
      last_name,
      email,
      company,
      attended,
      events(name, start_date, end_date, location)
    `)
    .eq("id", id)
    .single();

  if (error || !contact) {
    console.error(error);
    return <div className="p-6 text-xl">Contact not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">
        {contact.first_name} {contact.last_name}
      </h1>

      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <div>
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
        </div>

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

      <a
        href="/contacts"
        className="inline-block px-4 py-2 bg-[#3b4522] text-white rounded-lg hover:bg-[#2c341a]"
      >
        ← Back to Contacts
      </a>
    </div>
  );
}