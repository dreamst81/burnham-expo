import Image from "next/image";
import { User, BookOpen, Calendar, Search, LogOut, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#3b4522] text-white flex flex-col justify-between px-6 py-8 rounded-r-2xl">
      <div>
        {/* 🔥 Logo Section */}
<div className="mb-10">
  <div className="flex items-center">
    <Image
      src="/burnham-expo-logo.jpg"
      alt="Burnham Expo Logo"
      width={220}
      height={60}
      className="object-contain"
      priority
    />
  </div>
</div>

        {/* 🔽 Navigation */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90">
  <HomeIcon size={20} /> <span>Dashboard</span>
</Link>
          <Link href="/contacts" className="flex items-center space-x-3 hover:opacity-90">
  <BookOpen size={20} /> <span>Contacts</span>
</Link>
          <Link href="/events" className="flex items-center space-x-3 hover:opacity-90">
  <Calendar size={20} /> <span>Events</span>
</Link>
<Link href="/exhibitors" className="flex items-center space-x-3 hover:opacity-90">
  <User size={20} /> <span>Exhibitors</span>
</Link>
          <Link href="/users" className="flex items-center space-x-3 hover:opacity-90">
  <User size={20} /> <span>Users</span>
</Link>
        </div>
      </div>

      <button className="flex items-center space-x-3 text-sm mt-8">
        <LogOut size={18} /> <span>Logout</span>
      </button>
    </aside>
  );
}