import { 
  Users, 
  FileText, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Briefcase, 
  Search, 
  MoreVertical, 
  Loader2, 
  CalendarCheck, 
  AlertCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Activity,
  MapPin,
  Clock4,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { visaAgentApi } from "../../../lib/api";

export function VisaAgentDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingDS160: 0,
    pendingPayments: 0,
    upcomingBiometrics: 0,
    upcomingInterviews: 0,
    approved: 0,
    rejected: 0,
    monitoringCases: 0
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Summary Stats
      try {
        const summaryRes = await visaAgentApi.dashboard.getSummary();
        if (summaryRes.data) {
          setStats({
            totalClients: summaryRes.data.totalClients || 0,
            pendingDS160: summaryRes.data.pendingDS160 || 0,
            pendingPayments: summaryRes.data.pendingPayments || 0,
            upcomingBiometrics: summaryRes.data.upcomingBiometrics || 0,
            upcomingInterviews: summaryRes.data.upcomingInterviews || 0,
            approved: summaryRes.data.approved || 0,
            rejected: summaryRes.data.rejected || 0,
            monitoringCases: summaryRes.data.monitoringCases || 0
          });
        }
      } catch (e) {
        console.warn("Summary API failed", e);
      }

      // Fetch Urgent Actions (Alerts)
      try {
        const urgentRes = await visaAgentApi.dashboard.getUrgent();
        const alertsData = urgentRes.data?.urgentActions || urgentRes.data?.alerts || (Array.isArray(urgentRes.data) ? urgentRes.data : []);
        setAlerts(alertsData);
      } catch (e) {
        console.warn("Urgent API failed", e);
      }

      // Fetch Recent Clients
      try {
        const clientsRes = await visaAgentApi.clients.list({ limit: 10 });
        const clientsData = clientsRes.data?.clients || (Array.isArray(clientsRes.data) ? clientsRes.data : []);
        setClients(clientsData);
      } catch (e) {
        console.warn("Clients API failed", e);
      }
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Clients", value: stats.totalClients, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Pending DS160", value: stats.pendingDS160, icon: FileText, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Slot Monitoring", value: stats.monitoringCases, icon: Eye, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Upcoming Biometrics", value: stats.upcomingBiometrics, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { label: "Upcoming Interviews", value: stats.upcomingInterviews, icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  ];

  const pipelineStages = [
    { label: "Client Created", count: 12 },
    { label: "DS160 Pending", count: 5 },
    { label: "DS160 Submitted", count: 8 },
    { label: "Portal Created", count: 10 },
    { label: "Payment Pending", count: 3 },
    { label: "Payment Completed", count: 15 },
    { label: "Slot Monitoring", count: 7 },
    { label: "Slot Booked", count: 4 },
    { label: "Biometric", count: 2 },
    { label: "Interview", count: 1 },
    { label: "Result", count: stats.approved + stats.rejected },
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Visa Agent Dashboard</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Operational overview for client visa processing and appointment monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#4B5563] hover:bg-gray-50 transition-all shadow-sm">
            Download Report
          </button>
          <button 
            onClick={() => navigate('/visa-agent/clients/create')}
            className="px-4 py-2 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Quick Create Client
          </button>
          <button 
            onClick={() => navigate('/visa-agent/pipeline')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Lead Pipeline
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border bg-white ${stat.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-20 group-hover:scale-110 transition-transform`} />
            <div className="flex flex-col gap-3 relative z-10">
               <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">{stat.label}</p>
                 <h4 className={`text-xl font-black ${stat.color} mt-1`}>{stat.value}</h4>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Pipeline Flow Visualization */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 overflow-hidden">
        <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-8 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Client Pipeline Flow
        </h3>
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 hidden lg:block" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-4 relative z-10">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  i === 0 ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 
                  i < 6 ? 'bg-emerald-100 text-emerald-700' :
                  'bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}>
                  {stage.count}
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-[#111827] uppercase tracking-tighter leading-tight">{stage.label}</p>
                  {i < pipelineStages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-gray-300 mx-auto mt-1 lg:hidden" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
             <div className="p-6 border-b border-[#F3F4F6] flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-base font-black text-[#111827]">Active Pipeline</h3>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">Tracking recent client progress</p>
                </div>
                <div className="relative">
                   <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                   <input 
                     type="text" 
                     placeholder="Search Name, GX ID or Passport..." 
                     className="pl-9 pr-4 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-72 transition-all"
                   />
                </div>
             </div>
             
             <div className="overflow-x-auto relative min-h-[300px]">
               {loading && (
                 <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                 </div>
               )}
               <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Client Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Process Stage</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Payment Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {clients.length === 0 && !loading && (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center">
                           <div className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                               <Users className="w-6 h-6 text-gray-300" />
                             </div>
                             <p className="text-sm font-bold text-gray-400">No active clients found in pipeline</p>
                           </div>
                         </td>
                       </tr>
                    )}
                    {clients.map((client, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
                               {(client.fullName || client.linkedUser?.name || 'U').charAt(0)}
                             </div>
                             <div>
                               <p className="text-sm font-black text-[#111827]">{client.fullName || client.linkedUser?.name || 'Unknown'}</p>
                               <p className="text-[10px] text-[#6B7280] font-bold">{client.clientId || client.linkedUser?.gxId || 'N/A'}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-400" />
                             <p className="text-xs font-black text-[#374151]">{client.country || 'N/A'}</p>
                           </div>
                           <p className="text-[10px] text-[#6B7280] font-bold mt-0.5">{client.visaType || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1.5">
                             <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider w-fit ${
                               client.ds160Status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                             }`}>
                               {client.ds160Status || 'DS-160 Pending'}
                             </span>
                             <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${client.ds160Status === 'Submitted' ? 'w-full bg-emerald-500' : 'w-1/3 bg-amber-500'}`} />
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                             client.visaFeePaymentStatus === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                           }`}>
                             {client.visaFeePaymentStatus || 'Payment Pending'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                               <FileText className="w-4 h-4" />
                             </button>
                             <button className="p-2 text-[#9CA3AF] hover:text-[#111827] rounded-lg">
                               <MoreVertical className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Urgent Actions & Right Column */}
        <div className="space-y-6">
           {/* Action Alerts */}
           <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest">Urgent Actions</h3>
                  <p className="text-[10px] text-[#6B7280] font-bold">Requires immediate attention</p>
                </div>
                <span className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-xs font-black">{alerts.length}</span>
             </div>
             
             {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">All caught up!</p>
                </div>
             ) : (
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                     <div key={i} className="flex items-start gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100 group cursor-pointer hover:bg-red-50 transition-colors">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-red-900 leading-snug">{alert.message}</p>
                           <p className="text-[9px] text-red-600 font-black uppercase mt-1 tracking-widest">Process Now →</p>
                        </div>
                     </div>
                  ))}
                </div>
             )}
           </div>

           {/* Upcoming Dates */}
           <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6">Upcoming Dates</h3>
              <div className="space-y-4">
                 {[
                   { type: 'Biometric', client: 'Rahul Sharma', date: 'Oct 12', time: '10:30 AM', color: 'indigo' },
                   { type: 'Interview', client: 'Sneha Patil', date: 'Oct 15', time: '09:00 AM', color: 'purple' },
                   { type: 'Monitoring', client: 'Amit Verma', date: 'Oct 18', time: 'Ongoing', color: 'blue' },
                 ].map((date, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${date.color}-50 flex flex-col items-center justify-center text-${date.color}-600`}>
                        <span className="text-[8px] font-black uppercase">{date.date.split(' ')[0]}</span>
                        <span className="text-sm font-black leading-none">{date.date.split(' ')[1]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-[#111827]">{date.client}</p>
                        <p className="text-[10px] text-[#6B7280] font-bold">{date.type} • {date.time}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-50 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2.5 border border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#4B5563] uppercase tracking-widest hover:bg-gray-50 transition-all">
                View Calendar
              </button>
           </div>

           {/* Recent Activity */}
           <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock4 className="w-4 h-4 text-emerald-500" />
                Recent Activity
              </h3>
              <div className="space-y-6 relative">
                 <div className="absolute top-0 bottom-0 left-3 w-px bg-gray-100" />
                 {[
                   { action: 'DS-160 Submitted', client: 'Sneha Patil', time: '2h ago', icon: FileText, color: 'emerald' },
                   { action: 'Portal Login Created', client: 'Rahul Sharma', time: '4h ago', icon: Users, color: 'blue' },
                   { action: 'Payment Verified', client: 'Amit Verma', time: '6h ago', icon: CreditCard, color: 'amber' },
                 ].map((act, i) => (
                   <div key={i} className="flex items-start gap-4 relative z-10">
                      <div className={`w-6 h-6 rounded-lg bg-${act.color}-50 border border-${act.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <act.icon className={`w-3 h-3 text-${act.color}-600`} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#111827]">{act.action}</p>
                        <p className="text-[10px] text-[#6B7280] font-bold">For <span className="text-[#111827]">{act.client}</span> • {act.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
