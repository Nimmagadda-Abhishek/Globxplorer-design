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
    { label: "Total Leads", count: stats.totalClients },
    { label: "DS160 Pending", count: stats.pendingDS160 },
    { label: "Payment Pending", count: stats.pendingPayments },
    { label: "Slot Monitoring", count: stats.monitoringCases },
    { label: "Biometrics", count: stats.upcomingBiometrics },
    { label: "Interviews", count: stats.upcomingInterviews },
    { label: "Processed", count: stats.approved + stats.rejected },
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  i === 0 ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 
                  i < pipelineStages.length - 1 ? 'bg-emerald-100 text-emerald-700' :
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

           {/* CRM Manual */}
           <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Visa Agent Manual
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-black text-indigo-900 mb-2">1. Client Management</h4>
                    <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                       Create new clients using the "Quick Create Client" button. Ensure all required documents are collected before moving the client to the "DS-160 Submitted" stage.
                    </p>
                 </div>
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-black text-emerald-900 mb-2">2. Application Processing</h4>
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                       Update the DS-160 status and Visa Fee Payment status in the Lead Pipeline. Once payments are verified, schedule the biometric and interview appointments.
                    </p>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-black text-amber-900 mb-2">3. Slot Monitoring</h4>
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                       Keep an eye on the "Slot Monitoring" pipeline stage. If an earlier slot becomes available, notify the client and reschedule through the portal.
                    </p>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="text-xs font-black text-purple-900 mb-2">4. Support & Communication</h4>
                    <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
                       Use the client profile page to track communications. Check the "Urgent Actions" section daily for alerts on missing documents or approaching deadlines.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
