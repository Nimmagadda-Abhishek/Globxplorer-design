import { 
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  MessageSquare,
  FileText,
  Video,
  ChevronRight,
  Bell,
  ArrowRight,
  MoreVertical,
  Phone,
  Calendar,
  Check,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { counsellorApi } from "../../lib/api";
import { PaymentRequestModal } from "../components/modals/PaymentRequestModal";
import { AddStudentModal } from "../components/modals/AddStudentModal";

export function CounsellorDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [urgentActions, setUrgentActions] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [ktDocs, setKtDocs] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, urgentRes, pipelineRes, studentsRes] = await Promise.all([
        counsellorApi.getStats(),
        counsellorApi.getUrgentActions(),
        counsellorApi.getPipeline(),
        counsellorApi.getMyStudents({ limit: 5 })
      ]);

      const d = statsRes.data;
      setStats(d.stats);
      setFollowUps(d.todayFollowUps || []);
      setChats(d.recentChats || []);
      setWebinars(d.upcomingWebinars || []);
      setKtDocs(d.ktDocs || []);
      setActivity(d.recentActivity || []);
      
      setUrgentActions(urgentRes.data);
      setPipeline(pipelineRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { label: "Assigned Leads", value: stats?.assignedLeads || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Students", value: stats?.activeStudents || "0", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Follow-ups Due", value: stats?.followUpsToday || "0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Offers Received", value: stats?.offersReceived || "0", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Visa Approved", value: stats?.visaApproved || "0", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Conversion Rate", value: stats?.conversionRate || "0%", icon: BarChart3, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Counsellor Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Welcome back! Here's what needs your attention today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Request Payment
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <button 
            onClick={() => setShowAddStudent(true)}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {showPaymentModal && <PaymentRequestModal onClose={() => setShowPaymentModal(false)} />}
      <AddStudentModal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} onSuccess={fetchDashboardData} />

      {/* SECTION 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{card.label}</p>
            <h4 className="text-xl font-black text-[#111827]">{loading ? "..." : card.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 2: URGENT ACTION PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-[#111827]">Urgent Action Panel</h3>
              </div>
              <button className="text-xs font-bold text-[#4F46E5] hover:underline">View All</button>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {urgentActions.length > 0 ? urgentActions.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${
                      item.status === 'alert' ? 'bg-red-600' : 
                      item.status === 'red' ? 'bg-red-400' : 
                      item.status === 'orange' ? 'bg-orange-400' : 'bg-green-400'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{item.name}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider">{item.stage.replace('_', ' ')}</span>
                         <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                         <span className="text-[10px] font-bold text-[#9CA3AF]">{item.pendingDays} days pending</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-50 text-[#4F46E5] rounded-lg hover:bg-indigo-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 bg-[#4F46E5] text-white text-[10px] font-bold rounded-lg hover:bg-[#4338CA] transition-colors">
                      Update Stage
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-[#9CA3AF] font-bold">No urgent actions pending. Good job!</div>
              )}
            </div>
          </div>

          {/* SECTION 3: PIPELINE BOARD (MINI) */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Pipeline Board Overview</h3>
            <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {['new_lead', 'contacted', 'pending_docs', 'country_shortlist', 'application_started', 'offer_received'].map((stage, i) => {
                const stageData = pipeline.find(p => p._id === stage);
                return (
                  <div key={i} className="min-w-[200px] flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">{stage.replace('_', ' ')}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-gray-200 rounded-md">{stageData?.count || 0}</span>
                    </div>
                    <div className="space-y-2">
                      {stageData?.students.slice(0, 2).map((s: any, j: number) => (
                        <div key={j} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-xs font-bold text-[#111827] mb-1">{s.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-[#9CA3AF] font-black">{s.gxId}</span>
                            <span className="text-[9px] text-blue-600 font-bold">{s.country}</span>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-2 text-[9px] font-black text-[#4F46E5] uppercase tracking-widest hover:bg-white rounded-lg transition-colors">View All</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: TODAY'S FOLLOW-UPS */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">Today's Follow-ups</h3>
              <Calendar className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="space-y-4">
              {followUps.length > 0 ? followUps.map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[#4F46E5] font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-[#111827]">{task.name}</p>
                      <span className="text-[9px] font-black text-[#9CA3AF]">{new Date(task.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-medium">{task.status}</p>
                  </div>
                  <button className="p-1.5 opacity-0 group-hover:opacity-100 bg-[#10B981] text-white rounded-md transition-all">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )) : (
                <div className="text-center py-4 text-xs text-gray-400 font-bold italic">No follow-ups for today.</div>
              )}
              <button className="w-full py-3 bg-indigo-50 text-[#4F46E5] text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">View Full Schedule</button>
            </div>
          </div>

          {/* SECTION 6: MINI CHAT WIDGET */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">Recent Chats</h3>
              <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="space-y-4">
               {chats.length > 0 ? chats.map((chat, i) => (
                 <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                      {chat.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-[#111827]">{chat.name}</p>
                          <span className="text-[9px] text-[#9CA3AF]">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <p className="text-[10px] text-[#6B7280] truncate font-medium">{chat.lastMessage}</p>
                    </div>
                    {chat.unread && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                 </div>
               )) : (
                 <div className="text-center py-4 text-xs text-gray-400 font-bold italic">No recent chats.</div>
               )}
               <button className="w-full py-3 border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">Go to Messenger</button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: MY STUDENTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#111827]">My Students</h3>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#4F46E5] w-full md:w-64"
                />
             </div>
             <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
                <Filter className="w-4 h-4 text-[#4B5563]" />
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">GX ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Country</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Stage</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Documents</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {students.length > 0 ? students.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-[#4F46E5]">{s.gxId}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#111827]">{s.name}</p>
                    <p className="text-[10px] text-[#6B7280] font-medium">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#111827]">{s.country || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                      {s.pipelineStage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] w-2/3" />
                       </div>
                       <span className="text-[10px] font-bold text-[#6B7280]">60%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-medium text-[#6B7280]">{new Date(s.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-[#9CA3AF] hover:text-[#111827]">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-gray-400 font-bold italic">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER PANELS: WEBINARS, KT DOCS, ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* SECTION 8: WEBINAR PANEL */}
         <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">Upcoming Webinars</h3>
              <Video className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="space-y-4">
               {webinars.length > 0 ? webinars.map((web, i) => (
                 <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <h4 className="text-xs font-black text-[#111827] mb-1">{web.title}</h4>
                    <p className="text-[10px] text-[#4F46E5] font-bold mb-3">{new Date(web.scheduledFor).toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-[#6B7280]">{web.registrations || 0} Registrations</span>
                       <button className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest flex items-center gap-1">Manage <ChevronRight className="w-3 h-3" /></button>
                    </div>
                 </div>
               )) : (
                 <div className="text-center py-4 text-xs text-gray-400 font-bold italic">No upcoming webinars.</div>
               )}
               <button className="w-full py-3 bg-white border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">Create New Webinar</button>
            </div>
         </div>

         {/* SECTION 9: KT DOCS / RESOURCES */}
         <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">KT Docs & Resources</h3>
              <FileText className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               {ktDocs.length > 0 ? ktDocs.map((res, i) => (
                 <div key={i} className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-transparent hover:border-current/20 cursor-pointer transition-all">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1">{res.title}</p>
                    <div className="flex items-center gap-1">
                       <ArrowRight className="w-3 h-3" />
                       <span className="text-[9px] font-bold">Open</span>
                    </div>
                 </div>
               )) : (
                 <div className="col-span-2 text-center py-4 text-xs text-gray-400 font-bold italic">No resources available.</div>
               )}
            </div>
            <button className="w-full mt-6 py-3 border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">All Resources</button>
         </div>

         {/* SECTION 10: NOTIFICATIONS & ACTIVITY */}
         <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">Recent Activity</h3>
              <Bell className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[#E5E7EB]">
               {activity.length > 0 ? activity.map((act, i) => (
                 <div key={i} className="pl-6 relative">
                    <div className="absolute left-0 top-1 w-4 h-4 bg-white border-2 border-[#4F46E5] rounded-full z-10" />
                    <p className="text-xs font-bold text-[#111827]">{act.action.replace('_', ' ')}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-[#6B7280] font-medium">{act.module || 'System'}</span>
                       <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                       <span className="text-[10px] text-[#9CA3AF] font-bold">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                 </div>
               )) : (
                 <div className="pl-6 text-xs text-gray-400 font-bold italic">No recent activity.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
