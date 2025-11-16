"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      router.push("/");
    }
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-start bg-slate-100 pt-10 px-6">
    
    {/* Logo */}
    <div className="mt-10 mb-10">
      <img
        src="/burnham-expo-logo.jpg"
        alt="Burnham Expo"
        className="w-56 opacity-90 mx-auto"
      />
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-900">
        Burnham Expo Login
      </h1>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-black placeholder-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            Password
          </label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 text-black placeholder-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3b4522] text-white py-2 rounded-lg hover:bg-[#2c341a] disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>
    </div>
  </div>
);
}