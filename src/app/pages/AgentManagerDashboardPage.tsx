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
  Users2,
  BookOpen
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
                {agents.map((agent, i) => {
                  const statusHistory = agent.agentDetails?.statusHistory || [];
                  const lastVisitDate = statusHistory.length > 0 
                    ? new Date(statusHistory[statusHistory.length - 1].date).toLocaleDateString()
                    : (agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'No visit yet');
                  const currentStatus = agent.agentDetails?.agentStatus || agent.status || 'not_visited';
                  
                  return (
                    <tr key={agent.gxId || agent._id || i} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-black text-[#111827]">
                            {agent.agentDetails?.businessName || agent.businessName || "Unnamed Business"}
                          </p>
                          <p className="text-[10px] text-[#6B7280]">
                            {agent.gxId} • {agent.name || agent.agentDetails?.customerWhatsappNumber || "No Owner"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${currentStatus === 'confirmed' || currentStatus === 'active' || currentStatus === 'partnered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>{currentStatus.replace('_', ' ')}</span>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-[#6B7280]">{lastVisitDate}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-indigo-50 hover:text-[#4F46E5] rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* SECTION 8: WEBSITE MANUAL */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden mb-8 mt-8">
        <div className="p-8 border-b border-[#F3F4F6] bg-gradient-to-r from-indigo-50 to-white">
          <h3 className="text-2xl font-black text-[#111827] flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#4F46E5]" />
            Agent Manager Operations Manual
          </h3>
          <p className="text-sm font-medium text-[#6B7280] mt-2">
            Your comprehensive guide to mastering the platform, maximizing performance, and managing your field network effectively.
          </p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="flex gap-4 p-6 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827] mb-1">Agent Network Management</h4>
                <p className="text-[10px] font-black text-blue-600 mb-3 uppercase tracking-widest">Core Feature</p>
                <div className="space-y-3">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Step:</strong> Use the "My Agents" panel to add new businesses. Monitor their status (Active, Visited) and track your last field visit.
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Benefit:</strong> Ensures a clear overview of your network health and quick identification of dormant partners requiring follow-ups.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-6 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827] mb-1">Lead & Student Tracking</h4>
                <p className="text-[10px] font-black text-purple-600 mb-3 uppercase tracking-widest">Core Feature</p>
                <div className="space-y-3">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Step:</strong> Click "View All" in the My Students table to monitor student application stages (Lead, Counseling, Offer).
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Benefit:</strong> Helps you forecast revenue and assist agents in converting their student leads faster through timely interventions.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-6 rounded-2xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827] mb-1">Smart Follow-ups & Alerts</h4>
                <p className="text-[10px] font-black text-orange-600 mb-3 uppercase tracking-widest">Core Feature</p>
                <div className="space-y-3">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Step:</strong> Check the Priority Alerts and Follow-ups panels daily. Mark completed tasks as "Done" or "Reschedule" them.
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Benefit:</strong> Never miss an important call or meeting, significantly increasing agent retention and lead conversion rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 p-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827] mb-1">Business Map View</h4>
                <p className="text-[10px] font-black text-emerald-600 mb-3 uppercase tracking-widest">Core Feature</p>
                <div className="space-y-3">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Step:</strong> Use the map to plan field visits geographically, targeting clusters of 'Revisit' or 'Active' agents in a specific area.
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Benefit:</strong> Optimizes travel time and costs by allowing you to plan highly efficient field trip routes and visit more agents per day.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4 p-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors lg:col-span-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827] mb-1">Performance Analytics</h4>
                <p className="text-[10px] font-black text-indigo-600 mb-3 uppercase tracking-widest">Core Feature</p>
                <div className="space-y-3">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Step:</strong> Monitor the Performance Analytics card, toggle between Monthly and Weekly views to track agents added, success rates, and overall conversions.
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    <strong className="text-[#111827] font-black">Benefit:</strong> Provides actionable data to measure your KPI achievements, identify operational bottlenecks, and adjust your strategy to maximize revenue.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


