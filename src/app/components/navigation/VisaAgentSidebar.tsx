import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  BarChart,
  LogOut,
  ChevronRight,
  Briefcase,
  KanbanSquare,
  UserPlus,
  ChevronDown,
  Bell,
  User
} from "lucide-react";
import { useState } from "react";
import { authApi } from "../../../lib/api";

const visaAgentNavGroups = [
  {
    group: "Operations",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/visa-agent/pipeline", label: "Leads Pipeline", icon: KanbanSquare },
      { path: "/visa-agent/create-client", label: "Create Client", icon: UserPlus },
      { path: "/visa-agent/clients", label: "Clients", icon: Users },
    ]
  },
  {
    group: "Filters",
    items: [
      { 
        label: "Countries", 
        icon: Globe, 
        submenu: [
          { path: "/visa-agent/countries/canada", label: "Canada" },
          { path: "/visa-agent/countries/germany", label: "Germany" },
          { path: "/visa-agent/countries/uk", label: "UK" },
          { path: "/visa-agent/countries/australia", label: "Australia" },
        ]
      },
      { 
        label: "Visa Type", 
        icon: FileText, 
        submenu: [
          { path: "/visa-agent/visa-type/b1", label: "B1" },
          { path: "/visa-agent/visa-type/b2", label: "B2" },
          { path: "/visa-agent/visa-type/b1-b2", label: "B1/B2" },
          { path: "/visa-agent/visa-type/f1", label: "F1" },
          { path: "/visa-agent/visa-type/h1b", label: "H1B" },
          { path: "/visa-agent/visa-type/f2", label: "F2" },
          { path: "/visa-agent/visa-type/h4", label: "H4" },
        ]
      },
    ]
  },
  {
    group: "Management",
    items: [
      { path: "/visa-agent/payments", label: "Payments", icon: CreditCard },
      { path: "/visa-agent/appointments", label: "Appointments", icon: Calendar },
      { path: "/visa-agent/documents", label: "Documents", icon: FileText },
      { path: "/visa-agent/reminders", label: "Reminders", icon: Clock },
      { path: "/visa-agent/notifications", label: "Notifications", icon: Bell },
      { path: "/visa-agent/analytics", label: "Analytics", icon: BarChart },
    ]
  },
  {
    group: "System",
    items: [
      { path: "/visa-agent/profile", label: "Profile", icon: User },
    ]
  }
];

export function VisaAgentSidebar() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/favicon.jpg" alt="GlobXplorer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">GlobXplorer</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Visa Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {visaAgentNavGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.group}</p>
            {group.items.map((item: any) => (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        expandedMenus.includes(item.label)
                          ? "bg-emerald-50/50 text-emerald-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 transition-colors ${expandedMenus.includes(item.label) ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.includes(item.label) ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedMenus.includes(item.label) && (
                      <div className="mt-1 ml-4 pl-4 border-l border-emerald-100 space-y-1">
                        {item.submenu.map((sub: any) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                isActive
                                  ? "text-emerald-600 bg-emerald-50"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
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
