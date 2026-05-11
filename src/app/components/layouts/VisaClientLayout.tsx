import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Calendar, 
  Shield, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  MessageSquare,
  Activity,
  Globe
} from "lucide-react";

export function VisaClientLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/client/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/client", icon: LayoutDashboard },
    { label: "Roadmap", path: "/client/roadmap", icon: Activity },
    { label: "Checklist", path: "/client/checklist", icon: FileText },
    { label: "Payments", path: "/client/payments", icon: CreditCard },
    { label: "Support", path: "/client/support", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#111827] text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">GlobX<span className="text-emerald-500">VC</span></span>
        </div>

        <nav className="flex-1 space-y-1 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/client' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all group ${
                  isActive 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 relative z-10 pt-6 border-t border-white/10">
          <Link
            to="/client/profile"
            className="flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-all"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-red-400 hover:text-red-300 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 lg:px-12 flex-shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-gray-50 rounded-xl"
            >
              <Menu className="w-6 h-6 text-[#111827]" />
            </button>
            <span className="text-xl font-black tracking-tight">GlobX<span className="text-emerald-500">VC</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">System Operational</span>
          </div>

          <div className="flex items-center gap-4">
             <button className="relative w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all">
                <Bell className="w-5 h-5 text-[#4B5563]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
             </button>
             <div className="w-px h-6 bg-gray-200" />
             <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                   <p className="text-xs font-black text-[#111827]">Client Portal</p>
                   <p className="text-[9px] text-emerald-600 font-black uppercase">Verified Session</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm">
                   C
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
           <aside className="absolute inset-y-0 left-0 w-80 bg-[#111827] p-6 flex flex-col animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-emerald-500" />
                    <span className="text-xl font-black tracking-tight text-white">GlobXVC</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <nav className="flex-1 space-y-2">
                 {navItems.map((item) => (
                   <Link
                     key={item.path}
                     to={item.path}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 hover:text-white"
                   >
                     <item.icon className="w-5 h-5" />
                     {item.label}
                   </Link>
                 ))}
              </nav>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                 <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-4 text-red-400 font-black text-xs uppercase tracking-widest w-full text-left">
                    <LogOut className="w-5 h-5" />
                    Logout
                 </button>
              </div>
           </aside>
        </div>
      )}
    </div>
  );
}
