import { 
  Bell, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Search,
  Filter,
  Plus,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { visaAgentApi } from "../../../lib/api";

export function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await visaAgentApi.reminders.list();
      const remindersData = res.data?.reminders || (Array.isArray(res.data) ? res.data : []);
      setReminders(remindersData);
    } catch (err) {
      console.error("Fetch reminders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Reminders", count: reminders.length },
    { id: "urgent", label: "Urgent", count: reminders.filter(r => r.priority === 'high').length },
    { id: "pending", label: "Pending", count: reminders.filter(r => !r.isRead).length },
    { id: "completed", label: "Completed", count: 0 }
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Smart Reminders</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Automated follow-ups and deadline alerts for your client pipeline.</p>
        </div>
        <button className="px-6 py-3 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Reminder
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm">
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-6">Categories</h3>
              <div className="space-y-2">
                 {categories.map(cat => (
                   <button
                     key={cat.id}
                     onClick={() => setActiveFilter(cat.id)}
                     className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                       activeFilter === cat.id 
                       ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                       : 'text-[#6B7280] hover:bg-gray-50 border border-transparent'
                     }`}
                   >
                     {cat.label}
                     <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                       activeFilter === cat.id ? 'bg-emerald-100' : 'bg-gray-100'
                     }`}>{cat.count}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-emerald-600 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-emerald-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                 <Bell className="w-8 h-8 text-emerald-200 mb-4" />
                 <h4 className="text-lg font-black leading-tight">System Automation</h4>
                 <p className="text-emerald-100 text-[10px] font-medium mt-2 leading-relaxed">Notifications are automatically sent to clients via WhatsApp and Email for all high priority tasks.</p>
                 <button className="mt-6 text-[10px] font-black uppercase tracking-widest bg-white text-emerald-600 px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-all">
                    Configure Rules
                 </button>
              </div>
           </div>
        </div>

        {/* Reminders List */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-white p-4 rounded-[32px] border border-[#E5E7EB] shadow-sm flex items-center gap-4">
              <div className="flex-1 relative">
                 <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Search reminders by client name or task..." 
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
                   <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Syncing Reminders...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] border border-[#E5E7EB] text-center space-y-4">
                   <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black text-[#111827]">Zero Pending Alerts</h3>
                   <p className="text-gray-500 font-medium max-w-sm mx-auto">Your pipeline is healthy and all follow-ups are current. Great job!</p>
                </div>
              ) : (
                reminders.map((reminder, i) => (
                   <div key={i} className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border ${
                        reminder.priority === 'high' 
                        ? 'bg-red-50 border-red-100 text-red-600' 
                        : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
                         <span className="text-[10px] font-black uppercase tracking-tighter">OCT</span>
                         <span className="text-xl font-black leading-none">{12 + i}</span>
                      </div>
                      
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-black text-[#111827]">{reminder.message}</h4>
                            {reminder.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest rounded-md">Urgent</span>
                            )}
                         </div>
                         <div className="flex items-center gap-4 text-[10px] text-[#6B7280] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                               <User className="w-3 h-3 text-gray-400" />
                               {reminder.clientName || 'Rahul Sharma'}
                            </span>
                            <span className="flex items-center gap-1.5">
                               <Clock className="w-3 h-3 text-gray-400" />
                               {reminder.time || '10:00 AM'}
                            </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                            Complete
                         </button>
                         <button className="p-2.5 text-gray-400 hover:text-[#111827] rounded-xl transition-all">
                            <MoreVertical className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                ))
              )}
           </div>

           {!loading && reminders.length > 0 && (
             <div className="bg-white p-6 rounded-[32px] border border-dashed border-gray-200 flex items-center justify-center">
                <button className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest hover:text-[#111827] transition-all flex items-center gap-2">
                   View Past Reminders
                   <ArrowRight className="w-3 h-3" />
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
