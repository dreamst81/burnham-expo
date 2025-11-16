"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="w-64 bg-[#3b4522] text-white min-h-screen p-6 space-y-6">

      {/* Logo */}
      <Link href="/" className="block mb-4">
        <img
          src="/burnham-expo-logo.jpg"
          alt="Burnham Logo"
          className="mx-auto w-40 object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="space-y-3">
        <Link href="/" className="block">Home</Link>
        <Link href="/events" className="block">Events</Link>
        <Link href="/contacts" className="block">Contacts</Link>
        <Link href="/exhibitors" className="block">Exhibitors</Link>
        <Link href="/trade-shows/341ac0f3-82e0-484a-9809-ff512d6722a4/map" className="block">
          Map
        </Link>
        <Link href="/schedule" className="block">My Schedule</Link>
        <Link href="/team-schedule" className="block">Team Schedule</Link>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full text-left text-sm px-3 py-2 rounded-lg text-red-700 hover:bg-red-100"
      >
        Log Out
      </button>
    </div>
  );
}