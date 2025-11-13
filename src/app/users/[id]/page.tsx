"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserProfilePage({ params }: any) {
  const { id } = use<{ id: string }>(params);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      setUser(data);
    }
    load();
  }, [id]);

  if (!user) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-3xl font-bold">{user.name}</h1>

      {user.avatar_url && (
        <img
          src={user.avatar_url}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover"
        />
      )}

      <div className="bg-white p-6 shadow rounded-xl space-y-2">
        <p className="text-gray-700">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Role:</span> {user.role}
        </p>
        {user.bio && (
          <p className="text-gray-700">
            <span className="font-semibold">Bio:</span> {user.bio}
          </p>
        )}
      </div>

      <a href="/users" className="text-[#3b4522] underline">
        ← Back to Users
      </a>
    </div>
  );
}