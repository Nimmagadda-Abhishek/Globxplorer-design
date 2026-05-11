import { BarChart3, TrendingUp, Users, Globe, Download, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function AnalyticsPage() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminApi.dashboard.getCharts();
      setChartData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const revenueTrend = chartData?.revenueTrend || [];
  const latestRevenue = revenueTrend.length > 0 ? revenueTrend[revenueTrend.length - 1].amount : 0;

  const countries = (chartData?.countryApplications || []).map((c: any) => ({
    name: c._id || 'Unknown',
    value: c.count || 0,
    color: 'bg-indigo-500'
  }));

  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Business Analytics</h1>
          <p className="text-sm text-[#6B7280]">Deep dive into your business performance and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#111827]">Leads vs Conversions (Monthly)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#4F46E5] rounded-full" />
                <span className="text-xs font-bold text-[#6B7280]">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                <span className="text-xs font-bold text-[#6B7280]">Conversions</span>
              </div>
            </div>
          </div>
          <div className="h-80 bg-gray-50 rounded-2xl border border-dashed border-[#E5E7EB] flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-[#CBD5E1]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111827] mb-8">Country-wise Applications</h3>
          <div className="space-y-6">
            {countries.map((country: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#111827]">{country.name}</span>
                  <span className="text-xs font-black text-[#6B7280]">{country.value} Apps</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${country.color || 'bg-indigo-500'} rounded-full`} style={{ width: `${Math.min(100, (country.value / 10) * 100)}%` }} />
                </div>
              </div>
            ))}
            {countries.length === 0 && <p className="text-xs text-center text-gray-500">No country data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Latest Revenue", value: `₹${latestRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: "Current Month", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { title: "Visa Approval Rate", value: chartData?.visaApprovalRate || "0%", label: "Target: 90%", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Students", value: chartData?.activeStudentsCount || "0", label: "Growing steady", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Drop-off Rate", value: chartData?.dropOffRate || "0%", label: "Decreased by 1%", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">{stat.title}</p>
            <h4 className="text-2xl font-black text-[#111827] mb-1">{stat.value}</h4>
            <p className="text-xs text-[#94A3B8] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

