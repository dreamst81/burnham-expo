import { User, BookOpen, Calendar, Search, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#3b4522] text-white flex flex-col justify-between p-6 rounded-r-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-8 leading-tight">
          BURNHAM<br/>EXPO
        </h1>
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