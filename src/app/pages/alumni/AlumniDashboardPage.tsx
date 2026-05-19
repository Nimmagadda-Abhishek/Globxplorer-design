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
    totalRequests: 0,
    completedServices: 0,
    earnings: "₹0",
    referralCount: 0,
    activeStudentsHelped: 0,
    pendingApprovals: 0
  });

  const [profile, setProfile] = useState<any>(null);
  const [studentRequests, setStudentRequests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [prStatus, setPrStatus] = useState<any>(null);
  const [salaryStats, setSalaryStats] = useState<any>(null);
  const [ambassadorStatus, setAmbassadorStatus] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, summaryRes, reqRes, jobsRes, prRes, salaryRes, ambRes] = await Promise.all([
          alumniApi.profile.get().catch(() => null),
          alumniApi.dashboard.getSummary().catch(() => null),
          alumniApi.communications.getRequests().catch(() => null),
          alumniApi.jobs.getAll().catch(() => null),
          alumniApi.prTracker.getStatus().catch(() => null),
          alumniApi.publicInsights.getSalaryRangeStats().catch(() => null),
          alumniApi.brandAmbassador.getStatus().catch(() => null)
        ]);
        
        if (profileRes?.profile) setProfile(profileRes.profile);
        if (summaryRes) {
          setStats({
            totalRequests: summaryRes.pendingRequests || 0,
            completedServices: summaryRes.completedServices || 0,
            earnings: `₹${summaryRes.totalEarned || 0}`,
            referralCount: summaryRes.referralCount || 0,
            referralEarnings: summaryRes.referralEarnings || 0,
            activeStudentsHelped: summaryRes.studentsHelped || 0,
            pendingApprovals: summaryRes.profileCompletion ? `${summaryRes.profileCompletion}%` : "0%"
          });
        }
        if (reqRes?.requests) setStudentRequests(reqRes.requests.slice(0, 3));
        if (jobsRes?.jobs) setJobs(jobsRes.jobs.slice(0, 2));
        if (prRes?.status) setPrStatus(prRes.status);
        if (salaryRes?.ranges) setSalaryStats(salaryRes.ranges[0]);
        if (ambRes?.applications) setAmbassadorStatus(ambRes.applications[0]);
        
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
          { label: "Total Requests", value: stats.totalRequests, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Completed Services", value: stats.completedServices, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
          { label: "Earnings", value: stats.earnings, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-100" },
          { label: "Referrals", value: stats.referralCount, icon: LinkIcon, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "Students Helped", value: stats.activeStudentsHelped, icon: Users, color: "text-teal-600", bg: "bg-teal-100" },
          { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
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
          
          {/* Latest Student Requests */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Latest Student Requests</h3>
              <Link to="/alumni/students" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {studentRequests.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                      {req.student?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{req.student?.name || 'Unknown Student'}</h4>
                      <p className="text-xs font-medium text-slate-500">{req.query || 'Mentorship'} • {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                    <button className="text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">View Request</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Job Opportunities */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">New Job Opportunities</h3>
              <Link to="/alumni/jobs" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                Job Board <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 border border-slate-100 rounded-2xl hover:border-violet-100 hover:bg-violet-50/30 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                      {job.match} Match
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{job.title}</h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">{job.company}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{job.location}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{job.type}</span>
                  </div>
                </div>
              ))}
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

          {/* Salary Insights */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4">Salary Insights (Your Role)</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  {salaryStats?.average || "₹0"} <span className="text-sm font-medium text-slate-500">{salaryStats?.currency || "INR"}/{salaryStats?.period || "yr"}</span>
                </h4>
                {salaryStats?.info && <p className="text-xs font-medium text-slate-500 mt-1">{salaryStats.info}</p>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-bold text-green-600">{salaryStats?.growth || "+0%"}</span>
                <span className="font-medium text-slate-500">vs last year</span>
              </div>
            </div>
          </div>

          {/* Upcoming Promotions */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Upcoming Promotions</h3>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {ambassadorStatus ? (
                `Your ${ambassadorStatus.roleType} application is currently ${ambassadorStatus.status}.`
              ) : (
                "You haven't applied for the Brand Ambassador program yet."
              )}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${ambassadorStatus?.status === 'Approved' ? 100 : (ambassadorStatus ? 50 : 0)}%` }}></div>
            </div>
            <Link to="/alumni/ambassador" className="block text-center mt-4 text-xs font-black text-violet-600 uppercase tracking-widest hover:text-violet-700">
              {ambassadorStatus ? "Check Status" : "Apply Now"}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

