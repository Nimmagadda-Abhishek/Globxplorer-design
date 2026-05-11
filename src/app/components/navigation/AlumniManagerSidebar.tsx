import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  GraduationCap, 
  Briefcase, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  UserCircle, 
  Settings, 
  LogOut,
  Tag
} from "lucide-react";
import { Link, useLocation } from "react-router";

export function AlumniManagerSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/alumni-manager" && currentPath === "/alumni-manager") return true;
    if (path !== "/alumni-manager" && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/alumni-manager" },
    { icon: UserPlus, label: "Alumni Registrations", path: "/alumni-manager/registrations" },
    { icon: Users, label: "Users", path: "/alumni-manager/users" },
    { icon: GraduationCap, label: "Students", path: "/alumni-manager/students" },
    { icon: Briefcase, label: "Service Requests", path: "/alumni-manager/service-requests" },
    { icon: Tag, label: "Pricing Control", path: "/alumni-manager/pricing" },
    { icon: CreditCard, label: "Payments", path: "/alumni-manager/payments" },
    { icon: MessageSquare, label: "Community Chat", path: "/alumni-manager/community" },
    { icon: BarChart3, label: "Reports", path: "/alumni-manager/reports" },
  ];

  const bottomItems = [
    { icon: Bell, label: "Notifications", path: "/alumni-manager/notifications" },
    { icon: UserCircle, label: "Profile", path: "/alumni-manager/profile" },
    { icon: Settings, label: "Settings", path: "/alumni-manager/settings" },
  ];

  return (
    <aside className="w-72 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 text-slate-300 z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/favicon.jpg" alt="GlobXplorer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">GlobXplorer</h1>
            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Alumni Manager</p>
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
                ? "bg-teal-500/10 text-teal-400 font-bold"
                : "hover:bg-slate-800 hover:text-white font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-teal-400" : "text-slate-400 group-hover:text-white"}`} />
            <span className="text-sm">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-auto shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
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
                ? "bg-teal-500/10 text-teal-400 font-bold"
                : "hover:bg-slate-800 hover:text-white font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-teal-400" : "text-slate-400 group-hover:text-white"}`} />
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
