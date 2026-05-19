import { NavLink, useNavigate } from "react-router";
import {
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  FileText,
  MessageSquare,
  CalendarCheck,
  Headset,
  Settings,
  ShieldCheck,
  Briefcase,
  Tag,
  Video,
  PhoneCall,
  LogOut,
  KanbanSquare,
  Clock,
  Globe,
  Trophy,
  BellRing,
  PieChart,
  BarChart3,
  CreditCard,
  User,
  Gift,
  Crown
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

import { authApi } from "../../../lib/api";

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const role = localStorage.getItem("userRole") || "ADMIN";
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/login");
    onClose();
  };

  const navItemsByRole: Record<string, any[]> = {
    ADMIN: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/users", label: "Users", icon: Users },
      { path: "/leads", label: "Leads", icon: PhoneCall },
      { path: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
    AGENT_MANAGER: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/agents", label: "My Agents", icon: UserCheck },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "/follow-ups", label: "Follow-ups", icon: Clock },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
    AGENT: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/pipeline", label: "Add Student", icon: KanbanSquare },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "/commissions", label: "Commissions", icon: CreditCard },
    ],
    COUNSELLOR: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/leads", label: "Leads", icon: PhoneCall },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { path: "/messages", label: "Chats", icon: MessageSquare },
      { path: "/webinars", label: "Webinars", icon: Video },
    ],
    TELECALLER: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/leads", label: "Leads", icon: PhoneCall },
      { path: "/follow-ups", label: "Follow-ups", icon: Clock },
    ],
    VISA_AGENT: [
      { path: "/visa-agent", label: "Dashboard", icon: LayoutDashboard },
      { path: "/visa-agent/pipeline", label: "Pipeline", icon: KanbanSquare },
      { path: "/visa-agent/clients", label: "Clients", icon: Users },
      { path: "/visa-agent/payments", label: "Payments", icon: CreditCard },
      { path: "/visa-agent/appointments", label: "Appointments", icon: CalendarCheck },
      { path: "/visa-agent/profile", label: "Profile", icon: User },
    ],
    STUDENT: [
      { path: "/student", label: "Dashboard", icon: LayoutDashboard },
      { path: "/student/application", label: "My Application", icon: KanbanSquare },
      { path: "/student/documents", label: "Document Center", icon: FileText },
      { path: "/student/payments", label: "Payments", icon: CreditCard },
      { path: "/student/subscription", label: "Subscription", icon: Crown },
      { path: "/student/chat", label: "Chat Support", icon: MessageSquare },
      { path: "/student/alumni", label: "Alumni Network", icon: Users },
      { path: "/student/profile", label: "Profile", icon: User },
    ]
  };

  const currentNavItems = navItemsByRole[role] || navItemsByRole.ADMIN;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
        onClick={onClose}
      />

      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-[#E5E7EB] flex flex-col z-[70] lg:hidden animate-in slide-in-from-left duration-300 ease-out shadow-2xl">
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB] bg-white sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/favicon.jpg" alt="GlobXplore" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-base font-black text-[#111827] tracking-tight">GlobXplore</span>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Mobile Console</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                  ? "bg-[#EEF2FF] text-[#4F46E5] shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#4F46E5]" : "text-[#9CA3AF]"}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-black transition-colors"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>
      </aside>
    </>
  );
}
