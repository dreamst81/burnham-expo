import Image from "next/image";
import { User, BookOpen, Calendar, Search, LogOut } from "lucide-react";

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
          <div className="flex items-center space-x-3">
            <User size={20} /> <span>Dan Roxas</span>
          </div>
          <div className="flex items-center space-x-3">
            <BookOpen size={20} /> <span>Contacts</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar size={20} /> <span>Events</span>
          </div>
          <div className="flex items-center space-x-3">
            <Search size={20} /> <span>Search</span>
          </div>
        </div>
      </div>

      <button className="flex items-center space-x-3 text-sm mt-8">
        <LogOut size={18} /> <span>Logout</span>
      </button>
    </aside>
  );
}