import { NavLink } from "react-router";
import {
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
  BarChart3,
  Users2,
  Clock,
  KanbanSquare,
  CreditCard,
  Gift,
  BellRing,
  PieChart,
  Trophy,
  Globe,
  Lock,
  ChevronDown,
  Search,
  Plus,
  UserPlus,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { AgentAddLeadModal } from "../modals/AgentAddLeadModal";
import { AddStudentModal } from "../modals/AddStudentModal";

const adminNavGroups = [
  {
    group: "Dashboard & Analytics",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/analytics", label: "Charts Section", icon: BarChart3 },
      { path: "/reports", label: "Weekly Reports", icon: PieChart },
    ]
  },
  {
    group: "User & Team Management",
    items: [
      { path: "/users", label: "User Management", icon: Users2 },
      { path: "/tracking", label: "Employee Tracking", icon: Clock },
      { path: "/telecaller-stats", label: "Telecaller Analytics", icon: Headset },
      { path: "/counsellor-panel", label: "Counsellor Panel", icon: UserCheck },
      { path: "/agent-panel", label: "Agent / Agent Manager", icon: ShieldCheck },
      { path: "/alumni-managers", label: "Alumni Managers", icon: GraduationCap },
    ]
  },
  {
    group: "Core Operations",
    items: [
      { path: "/leads", label: "Lead Management", icon: PhoneCall },
      { path: "/pipeline", label: "Student Pipeline", icon: KanbanSquare },
      { path: "/visa-panel", label: "Visa Panel", icon: Briefcase },
      { path: "/payments", label: "Payment Panel", icon: CreditCard },
    ]
  },
  {
    group: "Content & Partners",
    items: [
      { path: "/partner-offers", label: "Partner Offers", icon: Gift },
      { path: "/documents", label: "Document Center", icon: FileText },
      { path: "/marketing", label: "Content / Marketing", icon: Globe },
    ]
  },
  {
    group: "Engagement & Tools",
    items: [
      { path: "/alerts", label: "Alerts & Reminders", icon: BellRing },
      { path: "/whatsapp-logs", label: "WhatsApp Logs", icon: MessageSquare },
      { path: "/gamification", label: "Gamification", icon: Trophy },
      { path: "/settings", label: "Settings Panel", icon: Settings },
    ]
  }
];

const agentManagerNavGroups = [
  {
    group: "Primary",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/agents", label: "My Agents", icon: UserCheck },
      { path: "/agent-panel", label: "Add Agent", icon: UserPlus },
      { path: "/leads", label: "My Leads", icon: Users },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "#add-lead", label: "Add Lead", icon: Plus },
    ]
  },
  {
    group: "Operations",
    items: [
      { path: "/follow-ups", label: "Follow-ups", icon: Clock },
      { path: "/alerts", label: "Alerts", icon: BellRing },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/reports", label: "Reports", icon: PieChart },
    ]
  },
  {
    group: "System",
    items: [
      { path: "/notifications", label: "Notifications", icon: BellRing },
      { path: "/profile", label: "Profile", icon: Users },
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/logout", label: "Logout", icon: LogOut },
    ]
  }
];

const agentNavGroups = [
  {
    group: "Primary",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "#add-lead", label: "Add Lead", icon: Plus },
      { path: "/leads", label: "My Leads", icon: Users },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "/commissions", label: "Commissions", icon: CreditCard },
      { path: "/applications/status", label: "Application Status", icon: KanbanSquare },
    ]
  },
  {
    group: "Features",
    items: [
      { path: "/offers", label: "Offers & Benefits", icon: Gift },
      { path: "/my-business", label: "My Business", icon: Briefcase },
    ]
  },
  {
    group: "System",
    items: [
      { path: "/notifications", label: "Notifications", icon: BellRing },
      { path: "/profile", label: "Profile", icon: UserCheck },
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/logout", label: "Logout", icon: LogOut },
    ]
  }
];
const telecallerNavGroups = [
  {
    group: "Operations",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/leads", label: "All Leads", icon: PhoneCall },
      { path: "/assigned-leads", label: "Assigned Leads", icon: Users },
      { path: "/queue", label: "Lead Queue", icon: Clock },
      { path: "/follow-ups", label: "Follow-ups", icon: Clock },
    ]
  },
  {
    group: "System",
    items: [
      { path: "/logout", label: "Logout", icon: LogOut },
    ]
  }
];

const counsellorNavGroups = [
  {
    group: "Operations",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/leads", label: "Leads", icon: PhoneCall },
      { path: "/students", label: "My Students", icon: GraduationCap },
      { path: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { path: "/follow-ups", label: "Follow-ups", icon: Clock },
    ]
  },
  {
    group: "Tools & Resources",
    items: [
      { path: "/messages", label: "Chats", icon: MessageSquare },
      { path: "/webinars", label: "Webinars", icon: Video },
    ]
  },
  {
    group: "System",
    items: [
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/logout", label: "Logout", icon: LogOut },
    ]
  }
];

import { authApi } from "../../../lib/api";

export function Sidebar() {
  const [showAddModal, setShowAddModal] = useState(false);
  const role = localStorage.getItem("userRole") || "ADMIN";
  const navGroups = role === "ADMIN"
    ? adminNavGroups
    : role === "AGENT_MANAGER"
      ? agentManagerNavGroups
      : role === "COUNSELLOR"
        ? counsellorNavGroups
        : role === "TELECALLER"
          ? telecallerNavGroups
          : agentNavGroups;

  if (role !== "ADMIN" && role !== "AGENT_MANAGER" && role !== "AGENT" && role !== "COUNSELLOR" && role !== "TELECALLER") return null;

  const isAM = role === "AGENT_MANAGER";
  const isAgent = role === "AGENT";
  const isCounsellor = role === "COUNSELLOR";
  const isTelecaller = role === "TELECALLER";

  return (
    <aside className="w-72 bg-white border-r border-[#E5E7EB] flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/favicon.jpg" alt="GlobXplore" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-base font-black text-[#111827] tracking-tight">GlobXplore</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{isAM ? "AM Console" : isAgent ? "Agent Console" : isCounsellor ? "Counsellor Console" : isTelecaller ? "Telecaller Console" : "Admin Control"}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-8 last:mb-0">
            <h3 className="px-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-4">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={async (e) => {
                    if (item.path === "/logout") {
                      e.preventDefault();
                      await authApi.logout();
                      window.location.href = "/login";
                    } else if (item.path === "#add-lead") {
                      e.preventDefault();
                      setShowAddModal(true);
                    }
                  }}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                      ? "bg-[#EEF2FF] text-[#4F46E5] shadow-sm shadow-indigo-50"
                      : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#4F46E5]' : 'text-[#9CA3AF] group-hover:text-[#4B5563]'}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {(isAgent || isAM) ? (
        <AgentAddLeadModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      ) : (
        <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      )}
    </aside>
  );
}


