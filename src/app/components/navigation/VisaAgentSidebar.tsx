import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Globe,
  Clock,
  FileText,
  LogOut,
  KanbanSquare,
  UserPlus,
  ChevronDown,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { authApi } from "../../../lib/api";

const visaAgentNavGroups = [
  {
    group: "Operations",
    items: [
      {
        path: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        path: "/visa-agent/pipeline",
        label: "Leads Pipeline",
        icon: KanbanSquare,
      },
      {
        path: "/visa-agent/clients/create",
        label: "Create Client",
        icon: UserPlus,
      },
      {
        path: "/visa-agent/clients",
        label: "Clients",
        icon: Users,
      },
    ],
  },

  {
    group: "Filters",
    items: [
      {
        label: "Countries",
        icon: Globe,
        submenu: [
          {
            path: "/visa-agent/countries/canada",
            label: "Canada",
          },
          {
            path: "/visa-agent/countries/germany",
            label: "Germany",
          },
          {
            path: "/visa-agent/countries/uk",
            label: "UK",
          },
          {
            path: "/visa-agent/countries/australia",
            label: "Australia",
          },
          {
            path: "/visa-agent/countries/ireland",
            label: "Ireland",
          },
        ],
      },

      {
        label: "Visa Type",
        icon: FileText,
        submenu: [
          {
            path: "/visa-agent/visa-type/b1",
            label: "B1",
          },
          {
            path: "/visa-agent/visa-type/b2",
            label: "B2",
          },
          {
            path: "/visa-agent/visa-type/b1-b2",
            label: "B1/B2",
          },
          {
            path: "/visa-agent/visa-type/f1",
            label: "F1",
          },
          {
            path: "/visa-agent/visa-type/h1b",
            label: "H1B",
          },
          {
            path: "/visa-agent/visa-type/f2",
            label: "F2",
          },
          {
            path: "/visa-agent/visa-type/h4",
            label: "H4",
          },
        ],
      },
    ],
  },

  {
    group: "Management",
    items: [
      {
        path: "/visa-agent/documents",
        label: "Documents",
        icon: FileText,
      },
      {
        path: "/visa-agent/reminders",
        label: "Reminders",
        icon: Clock,
      },
      {
        path: "/visa-agent/notifications",
        label: "Notifications",
        icon: Bell,
      },
    ],
  },

  {
    group: "System",
    items: [
      {
        path: "/visa-agent/profile",
        label: "Profile",
        icon: User,
      },
      {
        path: "/visa-agent/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];

export function VisaAgentSidebar() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm">

      {/* =====================================================
          BRAND HEADER
      ===================================================== */}

      <div className="h-28 px-5 border-b border-slate-100 flex items-center justify-center shrink-0">

        <div className="flex flex-col items-center justify-center">

          {/* Logo */}
          <img
            src="/favicon.png"
            alt="GlobXplore"
            className="w-16 h-14 object-contain"
          />

          {/* Role Name */}
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mt-1 text-center">
            Visa Portal
          </p>

        </div>

      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {visaAgentNavGroups.map((group) => (
          <div key={group.group} className="space-y-1">

            {/* Group Title */}
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {group.group}
            </p>

            {/* Group Items */}
            {group.items.map((item: any) => (
              <div key={item.label || item.path}>

                {/* =================================================
                    SUBMENU ITEM
                ================================================= */}

                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.label)}
                      className={`
                        w-full
                        group
                        flex
                        items-center
                        gap-3
                        px-4
                        py-2.5
                        rounded-xl
                        text-sm
                        font-semibold
                        transition-all
                        duration-200
                        ${
                          expandedMenus.includes(item.label)
                            ? "bg-emerald-50/50 text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          w-5
                          h-5
                          shrink-0
                          transition-colors
                          ${
                            expandedMenus.includes(item.label)
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      />

                      <span className="flex-1 text-left">
                        {item.label}
                      </span>

                      <ChevronDown
                        className={`
                          w-4
                          h-4
                          transition-transform
                          duration-200
                          ${
                            expandedMenus.includes(item.label)
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    {/* Submenu */}
                    {expandedMenus.includes(item.label) && (
                      <div className="mt-1 ml-4 pl-4 border-l border-emerald-100 space-y-1">
                        {item.submenu.map((sub: any) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive }) =>
                              `
                                block
                                px-4
                                py-2
                                text-xs
                                font-bold
                                rounded-lg
                                transition-all
                                ${
                                  isActive
                                    ? "text-emerald-600 bg-emerald-50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (

                  /* =================================================
                     NORMAL NAVIGATION ITEM
                  ================================================= */

                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `
                        group
                        flex
                        items-center
                        gap-3
                        px-4
                        py-2.5
                        rounded-xl
                        text-sm
                        font-semibold
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`
                            w-5
                            h-5
                            shrink-0
                            transition-colors
                            ${
                              isActive
                                ? "text-emerald-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }
                          `}
                        />

                        <span className="flex-1 truncate">
                          {item.label}
                        </span>

                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                )}

              </div>
            ))}

          </div>
        ))}

      </nav>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <div className="p-4 border-t border-slate-50 shrink-0">

        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            text-sm
            font-semibold
            text-red-500
            hover:bg-red-50
            transition-all
            duration-200
          "
        >
          <LogOut className="w-5 h-5 shrink-0" />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}