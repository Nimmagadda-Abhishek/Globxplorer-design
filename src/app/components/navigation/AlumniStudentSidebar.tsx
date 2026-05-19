import { 
  LayoutDashboard, 
  CreditCard, 
  Briefcase, 
  MessageSquare, 
  Target, 
  Users, 
  BarChart3, 
  Link as LinkIcon, 
  Award, 
  Bell, 
  UserCircle, 
  LogOut,
  GraduationCap,
  ShoppingBag
} from "lucide-react";
import { Link, useLocation } from "react-router";

export function AlumniStudentSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/alumni" && currentPath === "/alumni") return true;
    if (path !== "/alumni" && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/alumni" },
    { icon: CreditCard, label: "Payments", path: "/alumni/payments" },
    { icon: Briefcase, label: "Service Registration", path: "/alumni/services" },
    { icon: ShoppingBag, label: "Service Bookings", path: "/alumni/bookings" },
    { icon: MessageSquare, label: "Communication", path: "/alumni/communication" },
    { icon: Target, label: "Jobs", path: "/alumni/jobs" },
    { icon: Award, label: "PR Tracker", path: "/alumni/pr-tracker" },
    { icon: GraduationCap, label: "Students", path: "/alumni/students" },
    { icon: BarChart3, label: "Analytics", path: "/alumni/analytics" },
    { icon: LinkIcon, label: "Referrals", path: "/alumni/referrals" },
    { icon: Users, label: "Brand Ambassador", path: "/alumni/brand-ambassador" },
  ];

  const bottomItems = [
    { icon: Bell, label: "Notifications", path: "/alumni/notifications" },
    { icon: UserCircle, label: "Profile", path: "/alumni/profile" },
  ];

  return (
    <aside className="w-72 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 text-slate-300 z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/favicon.jpg" alt="GlobXplore" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">GlobXplore</h1>
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Alumni Mentor</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="mb-4 px-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</p>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-violet-600/10 text-violet-400 font-bold"
                : "hover:bg-slate-800 hover:text-white font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-violet-400" : "text-slate-400 group-hover:text-white"}`} />
            <span className="text-sm">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-auto shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            )}
          </Link>
        ))}

        <div className="mt-8 mb-4 px-2 pt-4 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account</p>
        </div>
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-violet-600/10 text-violet-400 font-bold"
                : "hover:bg-slate-800 hover:text-white font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-violet-400" : "text-slate-400 group-hover:text-white"}`} />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

