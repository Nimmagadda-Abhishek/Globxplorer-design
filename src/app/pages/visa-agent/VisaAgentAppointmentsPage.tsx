import { 
  CalendarCheck, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  MoreVertical, 
  Globe, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { appointmentApi, visaAgentApi } from "../../../lib/api";
import { toast } from "sonner";

export function VisaAgentAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.list();
      const data = res.data || res;
      setAppointments(data);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Visa Appointments</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Manage biometric and interview schedules for your clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-[#E5E7EB] rounded-2xl font-black text-sm text-[#4B5563] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
            Calendar View
          </button>
          <button className="px-6 py-3 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book Slot
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm">
            <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-6">Schedules</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "upcoming" 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'text-[#6B7280] hover:bg-gray-50 border border-transparent'
                }`}
              >
                Upcoming
                <span className="bg-emerald-100 px-2 py-0.5 rounded-full text-[9px]">{appointments.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "past" 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'text-[#6B7280] hover:bg-gray-50 border border-transparent'
                }`}
              >
                Past
                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[9px]">0</span>
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <CalendarCheck className="w-8 h-8 text-indigo-200 mb-4" />
              <h4 className="text-lg font-black leading-tight">Slot Monitoring</h4>
              <p className="text-indigo-100 text-[10px] font-medium mt-2 leading-relaxed">System is actively monitoring slot availability for 7 pending cases in your pipeline.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-[32px] border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by client name or country..." 
                className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
              />
            </div>
            <button className="p-3 bg-gray-50 text-[#6B7280] rounded-xl hover:bg-gray-100 transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-white p-20 rounded-[40px] border border-[#E5E7EB] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] border border-[#E5E7EB] text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-[#111827]">No Appointments Scheduled</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">Book slots for your clients to track their biometric and interview schedules here.</p>
              </div>
            ) : (
              appointments.map((appt, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-600">
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                        {appt.dateTime ? new Date(appt.dateTime).toLocaleString('en-US', { month: 'short' }) : '---'}
                    </span>
                    <span className="text-2xl font-black leading-none">
                        {appt.dateTime ? new Date(appt.dateTime).getDate() : '--'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-black text-[#111827]">{appt.client?.name || 'Unknown Client'}</h4>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md ${
                        appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                        appt.status === 'Done' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>{appt.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#6B7280] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        {appt.country || 'Not Set'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {appt.type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        {appt.dateTime ? new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                      Reschedule
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-[#111827] rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
