"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MyContactPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-700 text-center text-lg">
        Loading your contact…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500 text-center text-lg">
        No contact information found for this account.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto text-gray-900">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">

        {/* QR Code */}
        {profile.qr_url && (
          <div className="flex justify-center mb-8">
            <img
              src={profile.qr_url}
              alt="QR Code"
              className="w-48 h-48 rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Name */}
        <h1 className="text-2xl font-semibold text-center mb-1">
          {profile.full_name}
        </h1>

        {/* Title */}
        <p className="text-xl text-gray-600 text-center mb-8">
          {profile.title}
        </p>

        {/* Contact Info */}
        <div className="space-y-4 text-lg">

          <div>
            <span className="text-gray-500 font-medium">Email:</span>
            <span className="ml-2 text-gray-800 break-all">
              {profile.email}
            </span>
          </div>

          <div>
            <span className="text-gray-500 font-medium">Phone:</span>
            <span className="ml-2 text-gray-800">
              {profile.phone}
            </span>
          </div>

          <div>
            <span className="text-gray-500 font-medium">LinkedIn:</span>
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline break-all"
            >
              Profile
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}