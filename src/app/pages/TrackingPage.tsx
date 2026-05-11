import { Clock, Calendar, Search, Filter, ArrowUpRight, ArrowDownRight, Coffee, Laptop, LogIn, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function TrackingPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeNow: "0 / 0",
    avgHours: "0h",
    onLeave: "0 Today",
    attendance: "0%"
  });


  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, [date]);

  const fetchStats = async () => {
    try {
      const res = await adminApi.dashboard.getSummary();
      const summary = res.data || {};
      setStats({
        activeNow: `${summary.activeEmployeesToday || 0} / ${summary.totalEmployees || 0}`,
        avgHours: summary.avgWorkingHours || "0h",
        onLeave: `${summary.employeesOnLeave || 0} Today`,
        attendance: summary.attendancePercentage || "0%"
      });
    } catch (err) {
      console.error("Failed to fetch tracking stats", err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await adminApi.attendance.list({ date });
      const rawData = Array.isArray(res.data) ? res.data : (res.data?.attendance || []);
      
      const mappedData = rawData
        .filter((row: any) => row.userId?.role !== 'ADMIN') // Hide Admin's data
        .map((row: any) => {
          const activeHours = Math.floor(row.activeTime / 60);
          const activeMinutes = Math.floor(row.activeTime % 60);
          const idleHours = Math.floor(row.idleTime / 60);
          const idleMinutes = Math.floor(row.idleTime % 60);

          return {
            name: row.userId?.name || row.gxId || "Unknown",
            login: row.loginTime ? new Date(row.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
            logout: row.logoutTime ? new Date(row.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active",
            active: `${activeHours}h ${activeMinutes}m`,
            idle: `${idleHours}h ${idleMinutes}m`,
            status: row.status === 'active' ? 'Present' : 'Inactive',
            performance: row.activeTime > 300 ? 'High' : row.activeTime > 120 ? 'Neutral' : 'Low'
          };
        });

      setAttendance(mappedData);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Employee Tracking</h1>
          <p className="text-sm text-[#6B7280]">Monitor daily attendance, active hours, and employee performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#374151] hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Now", value: stats.activeNow, icon: Laptop, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Working Hours", value: stats.avgHours, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "On Leave", value: stats.onLeave, icon: Coffee, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Attendance %", value: stats.attendance, icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-lg font-black text-[#111827]">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>


      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 text-sm font-bold text-[#4F46E5] border border-[#E5E7EB] rounded-xl hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Role
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
            </div>
          )}
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Log In/Out</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Active/Idle</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {attendance.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-bold text-[#111827]">{row.user?.name || row.name}</td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <LogIn className="w-3 h-3 text-green-500" />
                        {row.login}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <LogOut className="w-3 h-3 text-red-500" />
                        {row.logout}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#111827]">{row.active}</span>
                      <span className="text-[10px] text-[#9CA3AF] bg-gray-100 px-1.5 py-0.5 rounded uppercase font-bold">{row.idle} Idle</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      row.status === "Present" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`text-xs font-black ${
                      row.performance === "High" ? "text-green-600" : row.performance === "Neutral" ? "text-blue-600" : "text-[#9CA3AF]"
                    }`}>
                      {row.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
