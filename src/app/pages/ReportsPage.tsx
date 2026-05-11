import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, TrendingUp, Users, DollarSign, GraduationCap, Loader2 } from "lucide-react";
import { adminApi } from "../../lib/api";

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    enrolled: 0,
    conversionRate: 0,
    totalRevenue: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes]: any = await Promise.all([
        adminApi.dashboard.getSummary(),
        adminApi.dashboard.getCharts()
      ]);

      const summary = summaryRes.data || {};
      setStats({
        totalLeads: summary.totalLeads || 0,
        enrolled: summary.activeStudents || 0,
        conversionRate: 0, // Calculate or get from chart data
        totalRevenue: summary.revenueThisMonth || 0,
      });

      const charts = chartRes.data || {};
      
      if (charts.countryApplications) {
        setCountryData(charts.countryApplications.map((c: any) => ({
          country: c.name,
          students: c.value
        })));
      }

      if (charts.revenueTrend) {
        setRevenueData(charts.revenueTrend.map((r: any) => ({
          month: r._id,
          revenue: r.amount
        })));
      }

      // Use dynamic data from API if available
      setMonthlyData(charts.performanceTrend || []);
      setSourceData(charts.leadSources || []);

      if (summary.totalLeads && summary.activeStudents) {
        setStats(prev => ({
          ...prev,
          conversionRate: Math.round((summary.activeStudents / summary.totalLeads) * 100)
        }));
      }


    } catch (err) {
      console.error("Analytics fetch failed", err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <div className="p-6">Loading analytics report...</div>;
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">Track your business performance and insights</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111827] mb-1">{stats.totalLeads.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280]">Total Leads (Historical)</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-left">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Real-time
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111827] mb-1">{stats.enrolled.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280]">Students Enrolled</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-left">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827] mb-1">{stats.conversionRate}%</p>
          <p className="text-sm text-[#6B7280]">Conversion Rate</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827] mb-1">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280]">Total Revenue</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Monthly Performance</h2>
              <p className="text-sm text-[#6B7280]">Leads vs conversions trend</p>
            </div>
            <select className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="leads" stroke="#4F46E5" strokeWidth={2} name="Leads" key="leads-line" />
              <Line type="monotone" dataKey="converted" stroke="#10B981" strokeWidth={2} name="Converted" key="converted-line" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Lead Sources</h2>
            <p className="text-sm text-[#6B7280]">Distribution by channel</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Top Destinations</h2>
            <p className="text-sm text-[#6B7280]">Students enrolled by country</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis dataKey="country" type="category" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="students" fill="#4F46E5" radius={[0, 6, 6, 0]} key="students-bar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Revenue Trend</h2>
            <p className="text-sm text-[#6B7280]">Monthly revenue overview</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} key="revenue-bar" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}