"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      const onLoginPage = pathname === "/login";

      if (!session && !onLoginPage) {
        // Not logged in → force to /login
        setIsLoggedIn(false);
        router.replace("/login");
      } else if (session && onLoginPage) {
        // Logged in but on login page → redirect home
        setIsLoggedIn(true);
        router.replace("/");
      } else {
        // Allowed through
        setIsLoggedIn(!!session);
      }

      setLoading(false);
    }

    checkAuth();

    // Listen for login/logout changes automatically
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!session) {
          router.replace("/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // 🌙 Prevent hydration mismatches
  if (loading) {
    return (
      <html>
        <body className="bg-[#f7f7f7]" />
      </html>
    );
  }

  // 🛑 Unauthenticated users see *only* the login page
  if (!isLoggedIn && pathname === "/login") {
    return (
      <html lang="en">
        <body className="bg-[#f7f7f7]">
          {children}
        </body>
      </html>
    );
  }

  // 🔐 Authenticated layout
  return (
    <html lang="en">
      <body className="bg-[#f7f7f7] flex">

        {/* Sidebar only when logged in */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 lg:ml-64">
          {children}
        </main>

        {/* Burnham Logo (bottom-right) */}
        <img
          src="/burnham-expo-logo.jpg"
          alt="Burnham Expo"
          className="hidden lg:block fixed bottom-4 right-4 w-40 opacity-70"
        />
      </body>
    </html>
  );
}