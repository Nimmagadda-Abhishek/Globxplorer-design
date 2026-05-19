import { Bell, Megaphone, LogOut, Search, GraduationCap, Plus, ChevronDown, User, Calendar, Video, Menu } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authApi, userApi } from "../../../lib/api";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile().catch(() => null);
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

  const role = localStorage.getItem("userRole") || "ADMIN";
  const isStaff = role === "ADMIN" || role === "AGENT_MANAGER" || role === "AGENT" || role === "COUNSELLOR" || role === "TELECALLER" || role === "VISA_AGENT";
  const isVisaAgent = role === "VISA_AGENT";

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/login");
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {isStaff && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Logo */}
        {(!isStaff || true) && (
          <div className={`${!isStaff ? 'flex' : 'flex lg:hidden'} items-center gap-2`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/favicon.jpg" alt="GlobXplore" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-black text-[#111827] tracking-tight">GlobXplore</span>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest leading-none">Overseas</span>
            </div>
          </div>
        )}

        {isStaff && (
          <div className="flex-1 max-w-md relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder={isVisaAgent ? "Search Name / GX ID / Passport..." : "Search GX ID, Business or Student..."}
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isVisaAgent && (
          <Link
            to="/visa-agent/clients/create"
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Create Client</span>
          </Link>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg mr-2">
          <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs font-bold text-[#4B5563]">{today}</span>
        </div>

        <NotificationBell />

        <div className="h-8 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="w-9 h-9 bg-[#EEF2FF] rounded-xl flex items-center justify-center text-[#4F46E5] font-black text-xs border border-indigo-50">
            {profile?.name?.charAt(0) || (role === "ADMIN" ? "AD" : role === "AGENT_MANAGER" ? "AM" : role === "COUNSELLOR" ? "CO" : role === "VISA_AGENT" ? "VA" : "AG")}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-[#111827]">
              {profile?.name || (role === "ADMIN" ? "Administrator" : role === "AGENT_MANAGER" ? "Agent Manager" : role === "COUNSELLOR" ? "Counsellor" : role === "VISA_AGENT" ? "Visa Agent" : "Agent")}
            </p>
            <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider block">Sign Out</button>
          </div>
        </div>
      </div>
    </header>
  );
}
