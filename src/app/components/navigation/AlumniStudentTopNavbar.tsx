import { Search, Bell, UserCircle, ChevronDown, CheckCircle2, TrendingUp } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { alumniApi } from "../../../lib/api";

export function AlumniStudentTopNavbar() {
  const [profile, setProfile] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Quick fetch for top navbar profile
    const fetchProfile = async () => {
      try {
        const res = await alumniApi.auth.getMe().catch(() => null);
        if (res?.profile) {
          setProfile(res.profile);
          if (res.profile._id) {
            localStorage.setItem("userId", res.profile._id);
          }
        } else {
          setProfile({ name: "Arjun Mehta", role: "Alumni Mentor" });
        }
        
        // Fetch summary for pending requests
        const summary = await alumniApi.dashboard.getSummary().catch(() => null);
        if (summary) {
          setPendingRequests(summary.pendingRequests || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, jobs, or requests..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-100">
          <div className="flex items-center gap-3 bg-violet-50 px-4 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Profile Level</p>
              <p className="text-sm font-black text-violet-900">Expert Mentor</p>
            </div>
          </div>
          
          <Link to="/alumni/students" className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl hover:bg-amber-100 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Requests</p>
              <p className="text-sm font-black text-amber-900">{pendingRequests} Pending</p>
            </div>
          </Link>
        </div>

        <NotificationBell />

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{profile?.name || "Loading..."}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {profile?.role === 'ALUMNI' ? 'Alumni Mentor' : (profile?.role || "Alumni Mentor")}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-violet-600 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
