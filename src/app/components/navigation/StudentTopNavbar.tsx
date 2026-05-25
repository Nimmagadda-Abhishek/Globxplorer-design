import { Search, HelpCircle, Bell, MessageCircle, User, ChevronDown, Menu } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { studentPortalApi } from "../../../lib/api";

interface StudentTopNavbarProps {
  onMenuClick?: () => void;
}

export function StudentTopNavbar({ onMenuClick }: StudentTopNavbarProps) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentPortalApi.profile.get().catch(() => null);
        if (res?.data) {
          setProfile(res.data);
          if (res.data._id) {
            localStorage.setItem("userId", res.data._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:block flex-1 max-w-xl relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search for courses, universities, or help..."
            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Search Button (Placeholder for smaller screens) */}
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <Search className="w-5 h-5" />
        </button>
        {/* WhatsApp Support Button */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#128C7E] transition-all shadow-lg shadow-green-100">
          <MessageCircle className="w-4 h-4" />
          Support
        </button>

        {/* Notifications */}
        <NotificationBell />

        <div className="h-8 w-px bg-slate-100 mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-3 pl-1 group">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none mb-1">{profile?.name || "Student"}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{profile?.gxId || "N/A"}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
