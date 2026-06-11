import { BarChart3, TrendingUp, Users, Globe, Download, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AnalyticsPage() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminApi.dashboard.exportCharts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Business_Analytics_Export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const leadsVsConversions = chartData?.leadsVsConversions || [];
  const latestRevenueData = chartData?.latestRevenue || [];
  const latestRevenue = latestRevenueData.length > 0 ? latestRevenueData[latestRevenueData.length - 1].revenue : 0;

  // Assign a color cycler for countries
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const countries = (chartData?.countryWiseApplications || []).map((c: any, index: number) => ({
    name: c.name || 'Unknown',
    value: c.value || 0,
    color: colors[index % colors.length]
  }));

  const visaApprovalData = chartData?.visaApprovalRate || [];
  const approvedVisa = visaApprovalData.find((v: any) => v.name === "Approved")?.value || 0;

  const activeStudentsData = chartData?.activeStudents || [];
  const activeStudentsCount = activeStudentsData.length > 0 ? activeStudentsData[activeStudentsData.length - 1].count : 0;

  const dropOffRateData = chartData?.dropOffRate || [];
  const dropOffRate = dropOffRateData.find((d: any) => d.stage === "Lead")?.rate || 0;

  // Calculate maximum for country bars
  const maxCountryValue = Math.max(...countries.map((c: any) => c.value), 10); // at least 10 to avoid division by zero

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
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100 disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Exporting..." : "Export Report"}
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
          <div className="h-80 w-full flex items-center justify-center">
             {leadsVsConversions.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={leadsVsConversions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                   <Tooltip 
                     cursor={{ fill: '#F3F4F6' }}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="leads" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                   <Bar dataKey="conversions" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full w-full bg-gray-50 rounded-2xl border border-dashed border-[#E5E7EB] flex items-center justify-center">
                 <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-[#CBD5E1] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#94A3B8]">No Data Available</p>
                 </div>
               </div>
             )}
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
                  <div className={`h-full ${country.color} rounded-full`} style={{ width: `${Math.min(100, (country.value / maxCountryValue) * 100)}%` }} />
                </div>
              </div>
            ))}
            {countries.length === 0 && <p className="text-xs text-center text-gray-500 mt-10">No country data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Latest Revenue", value: `₹${latestRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, label: "Current Month", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { title: "Visa Approval Rate", value: `${approvedVisa}%`, label: "Target: 90%", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Students", value: activeStudentsCount, label: "Growing steady", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Drop-off Rate (Lead)", value: `${dropOffRate}%`, label: "Decreased by 1%", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
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

