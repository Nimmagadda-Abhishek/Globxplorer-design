import { useState, useEffect } from "react";
import { Briefcase, MapPin, DollarSign, Eye, Users, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, perfRes] = await Promise.all([
        alumniApi.jobs.getAll().catch(() => null),
        alumniApi.jobs.getPerformance().catch(() => null)
      ]);

      if (jobsRes?.data) setJobs(jobsRes.data);

      if (perfRes?.data) setPerformance(perfRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAdd(false);
    alert("Job posted for verification!");
    // Call alumniApi.jobs.post(data) in real app
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Jobs</h1>
          <p className="text-slate-500 mt-1 font-medium">Post opportunities and track your referral commissions.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Views", value: performance?.views || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Applicants", value: performance?.applicants || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Successful Hires", value: performance?.hires || 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
          { label: "Earned Commission", value: performance?.commissions || "₹0", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-100" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Post Job Opportunity</h3>
          <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
              <input type="text" placeholder="Part-time Cafe Staff" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
              <input type="text" placeholder="Tim Hortons" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
              <input type="text" placeholder="Toronto, ON" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Salary Range</label>
              <input type="text" placeholder="18 CAD/hr" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold">Submit for Verification</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Your Job Posts</h3>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {job.status}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900">{job.title}</h4>
                <p className="text-sm font-bold text-slate-700">{job.company}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><DollarSign className="w-4 h-4" /> {job.salaryRange}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
