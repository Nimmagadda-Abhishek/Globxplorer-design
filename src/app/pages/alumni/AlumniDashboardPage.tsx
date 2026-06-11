import { 
  Briefcase, 
  DollarSign, 
  Users, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { alumniApi } from "../../../lib/api";

export function AlumniDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    activeServiceTypes: 0,
    completedServices: 0,
    pendingRequests: 0,
    studentsHelped: 0,
    profileCompletion: 0,
    referralEarnings: 0,
    referralCount: 0
  });

  const [profile, setProfile] = useState<any>(null);
  const [prStatus, setPrStatus] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, summaryRes] = await Promise.all([
          alumniApi.profile.get().catch(() => null),
          alumniApi.dashboard.getSummary().catch(() => null)
        ]);
        
        if (profileRes?.profile) setProfile(profileRes.profile);
        if (summaryRes) {
          setStats({
            totalEarned: summaryRes.totalEarned || 0,
            activeServiceTypes: summaryRes.activeServiceTypes || 0,
            completedServices: summaryRes.completedServices || 0,
            pendingRequests: summaryRes.pendingRequests || 0,
            studentsHelped: summaryRes.studentsHelped || 0,
            profileCompletion: summaryRes.profileCompletion || 0,
            referralEarnings: summaryRes.referralEarnings || 0,
            referralCount: summaryRes.referralCount || 0
          });
          if (summaryRes.prStatus !== undefined) {
            setPrStatus(summaryRes.prStatus);
          }
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const alumniDetails = profile?.alumniDetails || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your mentorships, services, and track your career growth.</p>
        </div>
      </div>

      {/* Payment Trust Message */}
      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Secure Payment Guarantee</h3>
            <p className="text-xs font-medium text-blue-700 mt-0.5 max-w-2xl">
              Every payment made by a student for your services is recorded and securely held by GlobXplore. 
              Funds are transferred to your bank account only when the service is marked as <strong>Completed</strong> by the student.
            </p>
          </div>
        </div>
        <Link to="/alumni/payments" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex-shrink-0 text-center">
          View Payout Status
        </Link>
      </div>

      {/* Profile Header Card */}
      {profile && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center text-3xl font-black text-violet-600 shadow-inner">
              {profile.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                  {alumniDetails.availability || "Available"}
                </span>
              </div>
              <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                {profile.gxId} • {alumniDetails.university}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-tight">
                  <Briefcase className="w-3.5 h-3.5" /> {alumniDetails.currentWorkingRole || "Professional"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-tight">
                  <Target className="w-3.5 h-3.5" /> {alumniDetails.livingLocation || "Global"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block max-w-xs text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">About You</p>
            <p className="text-sm font-medium text-slate-600 italic">
              "{alumniDetails.shortBio || "Sharing knowledge to help the next generation of students succeed."}"
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Pending Requests", value: stats.pendingRequests, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Completed Services", value: stats.completedServices, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
          { label: "Total Earned", value: `₹${stats.totalEarned}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-100" },
          { label: "Referrals", value: stats.referralCount, icon: LinkIcon, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "Students Helped", value: stats.studentsHelped, icon: Users, color: "text-teal-600", bg: "bg-teal-100" },
          { label: "Profile Completion", value: `${stats.profileCompletion}%`, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 spans): Main content (Requests, Jobs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Alumni Role Manual */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Alumni Role Manual</h3>
              <span className="text-sm font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">
                Quick Guide
              </span>
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Student Mentorship</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    Respond to student queries about your university, course, and country. Guide them through their application process and share your authentic experiences to help them make informed decisions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Offering Services</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    Offer customized services like SOP reviews, interview prep, or visa consultation. Set your prices and receive secure payments directly to your bank account upon service completion.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Career & Job Opportunities</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    Access an exclusive job board tailored for international alumni. Find roles that match your skills, track salary insights, and connect with global employers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">PR Tracking & Ambassador Program</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    Keep a log of your permanent residency progress in your host country. Additionally, apply to become a GlobXplore Brand Ambassador for special rewards and recognition.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 span): Trackers & Widgets */}
        <div className="space-y-8">
          
          {/* PR Progress Tracker */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-lg shadow-violet-600/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Award className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-violet-200" />
                <h3 className="text-lg font-black">PR Progress Tracker</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-violet-100">Current Phase</span>
                    <span className="font-black">{prStatus?.stage || "Not Started"}</span>
                  </div>
                  <div className="w-full bg-violet-900/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                      style={{ width: `${prStatus?.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-violet-500/30">
                  <p className="text-xs font-medium text-violet-200 uppercase tracking-widest mb-1">Country</p>
                  <p className="text-sm font-bold">{prStatus?.country || "None"}</p>
                </div>
                
                <Link to="/alumni/pr-tracker" className="w-full block text-center py-3 mt-2 bg-white text-violet-700 text-sm font-black rounded-xl hover:bg-violet-50 transition-colors">
                  Update Tracker
                </Link>
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

