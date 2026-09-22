import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  CreditCard,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useState } from "react";

export function AlumniManagerSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* =========================================================
     ACTIVE ROUTE
  ========================================================= */

  const isActive = (path: string) => {
    if (path === "/alumni-manager") {
      return currentPath === "/alumni-manager";
    }

    return currentPath.startsWith(path);
  };

  /* =========================================================
     MAIN NAVIGATION
  ========================================================= */

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/alumni-manager",
    },
    {
      icon: UserPlus,
      label: "Alumni Registrations",
      path: "/alumni-manager/registrations",
    },
    {
      icon: Users,
      label: "Users",
      path: "/alumni-manager/users",
    },
    {
      icon: GraduationCap,
      label: "Students",
      path: "/alumni-manager/students",
    },
    {
      icon: Briefcase,
      label: "Service Requests",
      path: "/alumni-manager/service-requests",
    },
    {
      icon: FileText,
      label: "Job Applications",
      path: "/alumni-manager/job-applications",
    },
    {
      icon: CreditCard,
      label: "Payments",
      path: "/alumni-manager/payments",
    },
    {
      icon: MessageSquare,
      label: "Community",
      path: "/alumni-manager/community",
    },
  ];

  /* =========================================================
     ACCOUNT NAVIGATION
  ========================================================= */

  const bottomItems = [
    {
      icon: Bell,
      label: "Notifications",
      path: "/alumni-manager/notifications",
    },
    {
      icon: UserCircle,
      label: "Profile",
      path: "/alumni-manager/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/alumni-manager/settings",
    },
  ];

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const handleNavigation = () => {
    setIsMobileOpen(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* =======================================================
          MOBILE TOP BAR
      ======================================================= */}

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4">

        {/* Brand */}

        <div className="flex items-center gap-3 min-w-0">

          <img
            src="/favicon.png"
            alt="GlobXplore"
            className="w-10 h-9 object-contain shrink-0"
          />

          <div className="min-w-0">

            <p className="text-sm font-extrabold text-white leading-tight truncate">
              GlobXplore
            </p>

            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest truncate">
              Alumni Manager
            </p>

          </div>

        </div>


        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
          aria-label={
            isMobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

      </div>


      {/* =======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}


      {/* =======================================================
          SIDEBAR
      ======================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          w-[280px]
          sm:w-72
          bg-slate-900
          text-slate-300
          flex
          flex-col
          z-50
          border-r
          border-slate-800
          transition-transform
          duration-300
          ease-out
          lg:translate-x-0
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =====================================================
            BRAND HEADER
        ===================================================== */}

        <div className="h-28 px-5 border-b border-slate-800 flex items-center justify-center shrink-0 relative">

  <div className="flex flex-col items-center justify-center">

    {/* Logo */}
    <img
      src="/favicon.png"
      alt="GlobXplore"
      className="w-16 h-14 object-contain"
    />

    {/* Role Name */}
    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.15em] mt-1 text-center">
      Alumni Manager
    </p>

  </div>

  {/* Mobile Close Button */}
  <button
    type="button"
    onClick={() => setIsMobileOpen(false)}
    className="lg:hidden absolute right-4 top-4 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
    aria-label="Close navigation"
  >
    <X className="w-5 h-5" />
  </button>

</div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            py-5
            px-3
            custom-scrollbar
          "
        >

          {/* MAIN MENU */}

          <div className="mb-3 px-3">

            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
              Main Menu
            </p>

          </div>


          <div className="space-y-1">

            {navItems.map((item) => {

              const active = isActive(item.path);

              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`
                    relative
                    flex
                    items-center
                    gap-3
                    px-3.5
                    py-2.5
                    rounded-xl
                    transition-all
                    duration-200
                    group
                    ${
                      active
                        ? "bg-teal-500/10 text-teal-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >

                  {/* Active Indicator */}

                  {active && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        -translate-y-1/2
                        w-1
                        h-6
                        bg-teal-400
                        rounded-r-full
                      "
                    />
                  )}


                  {/* Icon */}

                  <Icon
                    className={`
                      w-5
                      h-5
                      shrink-0
                      transition-colors
                      ${
                        active
                          ? "text-teal-400"
                          : "text-slate-500 group-hover:text-white"
                      }
                    `}
                  />


                  {/* Label */}

                  <span
                    className={`
                      text-sm
                      truncate
                      ${
                        active
                          ? "font-bold text-teal-400"
                          : "font-medium"
                      }
                    `}
                  >
                    {item.label}
                  </span>


                  {/* Active Dot */}

                  {active && (
                    <div
                      className="
                        ml-auto
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-teal-400
                        shadow-[0_0_8px_rgba(45,212,191,0.6)]
                        shrink-0
                      "
                    />
                  )}

                </Link>
              );

            })}

          </div>


          {/* ===================================================
              ACCOUNT
          =================================================== */}

          <div className="mt-7 pt-5 border-t border-slate-800">

            <div className="mb-3 px-3">

              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                Account
              </p>

            </div>


            <div className="space-y-1">

              {bottomItems.map((item) => {

                const active = isActive(item.path);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                    className={`
                      relative
                      flex
                      items-center
                      gap-3
                      px-3.5
                      py-2.5
                      rounded-xl
                      transition-all
                      duration-200
                      group
                      ${
                        active
                          ? "bg-teal-500/10 text-teal-400"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >

                    {/* Active Indicator */}

                    {active && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          -translate-y-1/2
                          w-1
                          h-6
                          bg-teal-400
                          rounded-r-full
                        "
                      />
                    )}


                    {/* Icon */}

                    <Icon
                      className={`
                        w-5
                        h-5
                        shrink-0
                        ${
                          active
                            ? "text-teal-400"
                            : "text-slate-500 group-hover:text-white"
                        }
                      `}
                    />


                    {/* Label */}

                    <span
                      className={`
                        text-sm
                        truncate
                        ${
                          active
                            ? "font-bold text-teal-400"
                            : "font-medium"
                        }
                      `}
                    >
                      {item.label}
                    </span>

                  </Link>
                );

              })}

            </div>

          </div>

        </nav>


        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <div className="p-3 border-t border-slate-800 shrink-0">

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              items-center
              gap-3
              px-3.5
              py-2.5
              w-full
              rounded-xl
              transition-all
              duration-200
              text-slate-400
              hover:bg-red-500/10
              hover:text-red-400
              font-medium
              group
            "
          >

            <LogOut
              className="
                w-5
                h-5
                shrink-0
                group-hover:text-red-400
                transition-colors
              "
            />

            <span className="text-sm">
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}
