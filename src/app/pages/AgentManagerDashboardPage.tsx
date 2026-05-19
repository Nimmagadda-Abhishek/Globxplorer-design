import {
  Users,
  UserCheck,
  Clock,
  GraduationCap,
  Briefcase,
  DollarSign,
  AlertCircle,
  Phone,
  RefreshCcw,
  MoreHorizontal,
  Search,
  Filter,
  MapPin,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Plus,
  Bell,
  User,
  History,
  FileText,
  ChevronRight,
  Loader2,
  UserPlus,
  Users2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { amApi } from "../../lib/api";

export function AgentManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [mapLocations, setMapLocations] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, agentsRes, studentsRes, activityRes, performanceRes, mapRes, followUpsRes] = await Promise.all([
        amApi.dashboard.getSummary(),
        amApi.agents.list({ limit: 5 }),
        amApi.students.list({ limit: 5 }),
        amApi.activity.list(),
        amApi.analytics.getPerformance(),
        amApi.map.getAgentLocations(),
        amApi.followUps.list()
      ]);

      // Summary: { success: true, data: { totalAgents, ..., priorityAlerts: [] } }
      const summaryData = summaryRes?.data || {};
      setSummary(summaryData);

      // Agents: Assume { success: true, data: { agents: [] } }
      const agentsList = agentsRes?.data?.agents || agentsRes?.data || [];
      setAgents(agentsList);

      // Students: { success: true, data: { students: [] } }
      const studentsList = studentsRes?.data?.students || studentsRes?.data || [];
      setStudents(studentsList);

      // Activity: { success: true, data: [ ... ] }
      const activityList = Array.isArray(activityRes?.data) ? activityRes.data : (activityRes?.data?.activities || []);
      setActivities(activityList);

      // Performance: { success: true, data: { monthlyStats: [], ... } }
      setPerformance(performanceRes?.data || null);

      setMapLocations(mapRes?.data || []);

      // Follow-ups List for the panel
      const followUpsList = followUpsRes?.data?.followups || followUpsRes?.data || [];
      if (!summaryData.followUpsList || summaryData.followUpsList.length === 0) {
        setSummary((prev: any) => ({
          ...prev,
          followUpsList: (Array.isArray(followUpsList) ? followUpsList : []).slice(0, 5)
        }));
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val || "$0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const kpis = [
    { label: "Total Agents", value: summary?.totalAgents || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50", desc: "Created by you" },
    { label: "Active Agents", value: summary?.activeAgents || "0", icon: UserCheck, color: "text-green-600", bg: "bg-green-50", desc: "Currently active" },
    { label: "Follow-ups Due Today", value: summary?.followUpsToday || "0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50", desc: "Urgent actions" },
    { label: "Students Added", value: summary?.totalStudents || "0", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", desc: "Under your AM" },
    { label: "Confirmed Businesses", value: summary?.confirmedBusinesses || "0", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Partnered" },
    { label: "Revenue Potential", value: formatCurrency(summary?.revenuePotential), icon: DollarSign, color: "text-cyan-600", bg: "bg-cyan-50", desc: "Estimated commissions" },
  ];


  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{kpi.label}</p>
            <h4 className="text-2xl font-black text-[#111827]">{kpi.value}</h4>
            <p className="text-[10px] text-[#6B7280] mt-1 font-medium">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 2: PRIORITY ALERTS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Priority Alerts
            </h3>
            <button onClick={() => navigate('/notifications')} className="text-xs font-bold text-[#4F46E5] hover:underline">View All Alerts</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(summary?.priorityAlerts || []).length > 0 ? summary.priorityAlerts.map((alert: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between group hover:border-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${alert.type === 'urgent' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{alert.title}</p>
                    <p className="text-xs text-[#6B7280]">{alert.count} instances found</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-indigo-50 text-[#4F46E5] rounded-lg hover:bg-indigo-100 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-[#111827] text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-colors">
                    Update
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 py-10 bg-white rounded-2xl border border-dashed border-[#E5E7EB] flex items-center justify-center">
                <p className="text-xs font-bold text-[#94A3B8]">No high-priority alerts today.</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 7: FOLLOW-UP PANEL */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Today's Follow-ups
          </h3>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="divide-y divide-[#F3F4F6]">
              {(summary?.followUpsList || []).length > 0 ? summary.followUpsList.map((item: any, i: number) => (
                <div key={i} className="p-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#4F46E5]">{item.id || item.gxId}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${(item.status === 'confirmed' || item.priority === 'high') ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {item.title || item.task || item.status || "Pending Action"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Marked ${item.id} as Done`)}
                      className="flex-1 py-2 bg-white border border-[#E5E7EB] rounded-lg text-[10px] font-bold text-[#111827] hover:bg-gray-50 transition-colors"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => navigate(`/follow-ups`)}
                      className="flex-1 py-2 bg-white border border-[#E5E7EB] rounded-lg text-[10px] font-bold text-[#111827] hover:bg-gray-50 transition-colors"
                    >
                      Reschedule
                    </button>
                    <button className="p-2 bg-[#F9FAFB] rounded-lg hover:bg-gray-100"><RefreshCcw className="w-3 h-3 text-[#6B7280]" /></button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center">
                  <p className="text-xs font-bold text-[#94A3B8]">All follow-ups completed!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 & 4: TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* MY AGENTS TABLE */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between">
            <h3 className="font-black text-[#111827]">My Agents</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#6B7280]"><Filter className="w-4 h-4" /></button>
              <button onClick={() => navigate('/agents')} className="text-xs font-bold text-[#4F46E5]">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Business</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Last Visit</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {agents.map((agent, i) => (
                  <tr key={agent.gxId || i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-[#111827]">
                          {agent.agentDetails?.businessName || agent.businessName || agent.name || "Unnamed Business"}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">
                          {agent.gxId} • {agent.agentDetails?.businessOwnerName || agent.businessOwnerName || agent.owner || "No Owner"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${agent.status === 'confirmed' || agent.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>{agent.status || 'not_visited'}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#6B7280]">{agent.lastVisit || 'No visit yet'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 hover:text-[#4F46E5] rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs font-bold text-[#9CA3AF]">No agents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MY STUDENTS TABLE */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between">
            <h3 className="font-black text-[#111827]">My Students</h3>
            <button onClick={() => navigate('/students')} className="text-xs font-bold text-[#4F46E5]">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Stage</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Last Update</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {students.map((student, i) => (
                  <tr key={student.gxId || i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-[#111827]">{student.fullName || student.name || "Unnamed Student"}</p>
                        <p className="text-[10px] text-[#6B7280]">{student.gxId} • {student.country || student.email || "No Location"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{student.stage || 'lead'}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#6B7280]">{student.updatedAt || student.createdAt || 'Just now'}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ExternalLink className="w-4 h-4 text-[#9CA3AF]" /></button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs font-bold text-[#9CA3AF]">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 5: BUSINESS MAP VIEW (MOCK) */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          <div className="p-6 border-b border-[#F3F4F6] flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#111827]">Business Map View</h3>
              <p className="text-xs text-[#6B7280]">Field visits & Area planning</p>
            </div>
          </div>
          <div className="flex-1 bg-[#F1F5F9] relative overflow-hidden min-h-[300px]">
            {/* Dynamic Map Markers */}
            {mapLocations.map((loc, i) => {
              const top = loc.lat || loc.latitude || (Math.random() * 80 + 10);
              const left = loc.lng || loc.longitude || (Math.random() * 80 + 10);
              // Ensure percentage-like values if they are real-world coords (simple normalization for demo)
              const displayTop = top > 100 ? (top % 100) : top;
              const displayLeft = left > 100 ? (left % 100) : left;

              return (
                <div key={i} className="absolute transition-all duration-500" style={{ top: `${displayTop}%`, left: `${displayLeft}%` }}>
                  <div className="relative group cursor-pointer">
                    <div className={`w-8 h-8 ${loc.status === 'confirmed' || loc.status === 'partnered' ? 'bg-[#10B981]' :
                        loc.status === 'visited' || loc.status === 'revisit' ? 'bg-orange-500' : 'bg-[#4F46E5]'
                      } rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transform hover:scale-125 transition-transform`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white p-2 rounded-lg shadow-xl border border-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <p className="text-[10px] font-black text-[#111827]">{loc.businessName || loc.name || "Agent Location"}</p>
                      <p className="text-[8px] text-[#6B7280]">Status: {loc.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {mapLocations.length === 0 && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 backdrop-blur-sm">
                <MapPin className="w-8 h-8 text-[#9CA3AF]" />
                <p className="text-xs font-bold text-[#94A3B8]">No business locations tracked yet</p>
              </div>
            )}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4194,37.7749,12/400x400?access_token=mock')] bg-cover opacity-20" />
            <div className="absolute bottom-6 right-6 bg-white p-2 rounded-xl shadow-lg border border-[#E5E7EB] space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4F46E5] rounded-full" /><span className="text-[10px] font-bold">Active</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full" /><span className="text-[10px] font-bold">Revisit</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-[10px] font-bold">Closed</span></div>
            </div>
          </div>
        </div>

        {/* SECTION 6: PERFORMANCE ANALYTICS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-[#111827]">Performance Analytics</h3>
              <select className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none">
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>

            <div className="space-y-6">
              {/* Dynamic Bar Chart */}
              <div>
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-4 tracking-widest">Agents Added Monthly</p>
                <div className="flex items-end gap-3 h-32">
                  {(performance?.monthlyAgents || performance?.monthlyStats || [0, 0, 0, 0, 0, 0]).map((h: number, i: number) => (
                    <div key={i} className="flex-1 bg-[#EEF2FF] rounded-t-lg relative group overflow-hidden">
                      <div style={{ height: `${h}%` }} className="bg-[#4F46E5] w-full absolute bottom-0 transition-all group-hover:bg-[#4338CA]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-2">Success Rate</p>
                  <h4 className="text-xl font-black text-[#111827]">{performance?.successRate || 0}%</h4>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#10B981]" style={{ width: `${performance?.successRate || 0}%` }} />
                  </div>
                </div>
                <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-2">Conversions</p>
                  <h4 className="text-xl font-black text-[#111827]">{performance?.conversions || 0}</h4>
                  <p className="text-[10px] text-green-600 font-bold">{performance?.weeklyGrowth || '+0'} this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 8: RECENT ACTIVITY FEED */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h3>
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 relative">
            <div className="absolute left-[35px] top-6 bottom-6 w-px bg-[#F1F5F9]" />
            <div className="space-y-6 relative">
              {activities.length > 0 ? activities.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 ${item.type === 'agent' ? 'bg-blue-500' :
                      item.type === 'student' ? 'bg-purple-500' : 'bg-green-500'
                    } rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-50 z-10`}>
                    {item.type === 'agent' ? <Plus className="w-5 h-5" /> :
                      item.type === 'student' ? <User className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{item.action || item.description || "Activity"}</p>
                    <p className="text-xs text-[#4F46E5] font-black uppercase mt-0.5">{item.target || item.gxId || item.title || "Record"}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{item.time || item.createdAt || 'Recently'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-center text-[#6B7280] py-10">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 9: SMART SEARCH & QUICK ACTIONS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
            <h3 className="text-xl font-black text-[#111827] mb-6">Smart Search Panel</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by Business Name, Owner, GX ID or Phone..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4F46E5] transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery.length > 3 && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-orange-900">Duplicate Business Detected!</p>
                  <p className="text-xs text-orange-700 font-medium">GXAG123456 - ABC Travels already exists. Visited before on 20 Apr.</p>
                  <button
                    onClick={() => navigate(`/agents/GXAG123456`)}
                    className="mt-2 text-xs font-black text-orange-900 underline uppercase tracking-wider"
                  >
                    View Original Record
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Add Agent", icon: Plus, path: '/agent-panel' },
                { label: "Add Lead", icon: UserPlus, path: '/pipeline' },
                { label: "Export Report", icon: FileText, path: '/reports' },
                { label: "Send Reminder", icon: Bell, path: '/notifications' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => navigate(btn.path)}
                  className="flex flex-col items-center gap-3 p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#4F46E5] hover:shadow-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#F9FAFB] group-hover:bg-[#EEF2FF] rounded-xl flex items-center justify-center transition-colors">
                    <btn.icon className="w-5 h-5 text-[#6B7280] group-hover:text-[#4F46E5]" />
                  </div>
                  <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/analytics')}
              className="flex-1 min-w-[150px] px-6 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Performance Report
            </button>
            <button
              onClick={() => window.location.href = 'mailto:admin@GlobXplore.com'}
              className="flex-1 min-w-[150px] px-6 py-4 bg-[#4F46E5] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#4338CA] transition-all flex items-center justify-center gap-2"
            >
              <Users2 className="w-4 h-4" />
              Contact Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


