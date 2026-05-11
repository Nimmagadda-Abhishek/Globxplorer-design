import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Building2, Briefcase, Loader2 } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Using getAnalytics as a proxy to fetch basic structure for the page
        const res = await alumniApi.career.getAnalytics().catch(() => null);
        if (res?.data) {
          setData(res.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Career Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Insights on salary trends and employment rates.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alumni Employment Rate</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.employmentRate}</h3>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Market Salary</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.avgSalary}</h3>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Experience</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">3 Years</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Salary Growth Trend</h3>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-slate-100 pb-4">
                {data?.salaryGrowth?.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-violet-100 group-hover:bg-violet-200 transition-colors rounded-t-xl relative flex justify-center" style={{ height: `${(item.val / 100000) * 100}%` }}>
                      <span className="absolute -top-8 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">${item.val/1000}k</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-4">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Top Roles in Your Field</h3>
              </div>
              
              <div className="space-y-4">
                {data?.topRoles?.map((role: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                        #{i+1}
                      </div>
                      <span className="font-bold text-slate-900">{role}</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">High Demand</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
