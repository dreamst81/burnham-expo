"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* 🟢 Mobile Hamburger (always visible) */}
      {mounted && (
        <button
          onClick={() => setOpen(true)}
          className="
            lg:hidden 
            fixed top-3 left-3 
            z-50 
            text-2xl font-bold 
            bg-[#3b4522] text-white 
            px-3 py-1 rounded-md shadow-md
          "
        >
          ☰
        </button>
      )}

      {/* 🟢 Sidebar Drawer (fixed to prevent layout shifts) */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 
          shadow-xl transform transition-transform duration-300 
          z-40

          /* Desktop */
          lg:translate-x-0 
          lg:bg-[#3b4522] lg:text-white 

          /* Mobile Drawer */
          ${open ? "translate-x-0" : "-translate-x-full"} 
          bg-[#f2f2f2] text-black
        `}
        style={{ position: "fixed" }}   // 🔥 critical fix
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Desktop Logo */}
          <Image
            src="/burnham-expo-logo.jpg"
            alt="Burnham Expo Logo"
            width={180}
            height={50}
            className="hidden lg:block mx-auto object-contain"
          />

          {/* Navigation */}
          <nav className="space-y-4">
            {[
              { label: "Home", href: "/" },
              { label: "Events", href: "/events" },
              { label: "Contacts", href: "/contacts" },
              { label: "Exhibitors", href: "/exhibitors" },
              {
                label: "MWW Map",
                href: "/trade-shows/341ac0f3-82e0-484a-9809-ff512d6722a4/map",
              },
              { label: "TODAY", href: "/schedule/today" },
              { label: "My Schedule", href: "/schedule" },
              { label: "Team Schedule", href: "/team-schedule" },
              { label: "My vCard", href: "/my-contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)} // close drawer
                className="block text-lg hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-8 block w-full text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🟢 Mobile Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}