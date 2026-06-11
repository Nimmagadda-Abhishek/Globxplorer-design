import { NavLink } from "react-router";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  CreditCard,
  Crown,
  BookOpen,
  MessageSquare,
  Users,
  Gift,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Briefcase
} from "lucide-react";

const studentNavItems = [
  { path: "/student", label: "Dashboard", icon: LayoutDashboard },
  { path: "/student/application", label: "My Application", icon: GraduationCap },
  { path: "/student/documents", label: "Documents", icon: FileText },
  { path: "/student/payments", label: "Payments", icon: CreditCard },
  { path: "/student/subscription", label: "Subscription", icon: Crown },
  { path: "/student/chat", label: "Chat Support", icon: MessageSquare },
  { path: "/student/alumni", label: "Alumni Connect", icon: Users },
  { path: "/student/jobs", label: "Jobs", icon: Briefcase },
  { path: "/student/my-bookings", label: "My Bookings", icon: BookOpen },
  { path: "/student/notifications", label: "Notifications", icon: Bell },
  { path: "/student/profile", label: "Profile", icon: User },
];

import { authApi } from "../../../lib/api";

export function StudentSidebar() {
  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/favicon.jpg" alt="GlobXplore" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">GlobXplore</h1>
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {studentNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/student"}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

