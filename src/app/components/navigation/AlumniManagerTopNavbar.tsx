import { Search, Bell, DollarSign, UserCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniManagerTopNavbar() {
  const [revenue, setRevenue] = useState("₹0");
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Quick fetch for top navbar summary
    const fetchSummary = async () => {
      try {
        const [summaryRes, profileRes] = await Promise.all([
          alumniManagerApi.dashboard.getSummary().catch(() => null),
          alumniManagerApi.auth.me().catch(() => null)
        ]);

        if (summaryRes?.data) {
          setRevenue(summaryRes.data.revenueThisMonth || "₹0");
          setPendingApprovals(summaryRes.data.pendingApprovals || 0);
        }
        if (profileRes?.data) {
          setProfile(profileRes.data);
          if (profileRes.data._id) {
            localStorage.setItem("userId", profileRes.data._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSummary();
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alumni by name, GX ID, or university..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-100">
          <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">MTD Revenue</p>
              <p className="text-sm font-black text-teal-900">{revenue}</p>
            </div>
          </div>
          
          <Link to="/alumni-manager/registrations" className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl hover:bg-amber-100 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Approvals</p>
              <p className="text-sm font-black text-amber-900">{pendingApprovals} Pending</p>
            </div>
          </Link>
        </div>

        <NotificationBell />

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{profile?.name || "Alumni Manager"}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{profile?.role || "Manager Portal"}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-teal-600 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
