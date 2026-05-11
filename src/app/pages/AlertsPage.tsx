import { BellRing, Clock, AlertTriangle, MessageSquare, PhoneOff, UserX, Send, RefreshCw, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.system.getAlerts();
      const alertsData = res.data?.alerts || (Array.isArray(res.data) ? res.data : []);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Alerts & Reminders</h1>
          <p className="text-sm text-[#6B7280]">Stay updated with critical system alerts and pending tasks.</p>
        </div>
        <button 
          onClick={fetchAlerts}
          disabled={loading}
          className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:bg-gray-50 disabled:opacity-50"
        >
           <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: "Critical Alerts", value: alerts.filter(a => a.priority === 'High').length.toString(), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pending Tasks", value: alerts.filter(a => a.type === 'Task').length.toString(), icon: PhoneOff, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "System Alerts", value: alerts.filter(a => a.type === 'System').length.toString(), icon: UserX, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "New Reminders", value: alerts.length.toString(), icon: BellRing, color: "text-blue-600", bg: "bg-blue-50" },
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

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
          </div>
        )}
        <div className="p-4 border-b border-[#F3F4F6] bg-[#F9FAFB]">
          <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Live Alert Feed</h3>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {alerts.map((alert, i) => (
            <div key={i} className="p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.priority === 'High' ? 'bg-red-50 text-red-500' : alert.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {alert.type === 'Follow-up' ? <Clock className="w-5 h-5" /> : alert.type === 'Call' ? <PhoneOff className="w-5 h-5" /> : alert.type === 'Deadline' ? <AlertTriangle className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#111827]">{alert.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        alert.priority === 'High' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{alert.priority} Priority</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">{alert.desc}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-2 font-bold">{alert.time}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-[10px] font-bold">
                     <Send className="w-3 h-3" />
                     Send Reminder
                   </button>
                   <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-[10px] font-bold">
                     <UserPlus className="w-3 h-3" />
                     Reassign
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
