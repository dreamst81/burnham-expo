"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("users").select("*");
      setUsers(data || []);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <ul className="space-y-4">
        {users.map((u) => (
          <li
            key={u.id}
            className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
            onClick={() => (window.location.href = `/users/${u.id}`)}
          >
            <span className="text-xl font-semibold">{u.name}</span>
            <p className="text-gray-600 text-sm">{u.email}</p>
            <p className="text-gray-500 text-sm">{u.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}