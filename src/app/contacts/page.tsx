import { supabase } from "@/lib/supabaseClient";

export default async function ContactsPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select(`
      id,
      first_name,
      last_name,
      email,
      company,
      attended,
      events(name)
    `);

  if (error) {
    console.error(error);
    return <div>Error loading contacts.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contacts</h1>

      <ul className="space-y-4">
        {contacts?.map((contact) => (
          <li
            key={contact.id}
            className="bg-white p-4 rounded-xl shadow flex flex-col"
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
          </li>
        ))}
      </ul>
    </div>
  );
}