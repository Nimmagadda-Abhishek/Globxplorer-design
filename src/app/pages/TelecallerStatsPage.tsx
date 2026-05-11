import { Headset, PhoneCall, CheckCircle, XCircle, Clock, TrendingUp, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function TelecallerStatsPage() {
  const [telecallers, setTelecallers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTelecallers();
  }, []);

  const fetchTelecallers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.telecallers.list();
      setTelecallers(res.data?.telecallers || []);
    } catch (err) {
      console.error("Failed to fetch telecallers:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Telecaller Analytics</h1>
        <p className="text-sm text-[#6B7280]">Monitor call performance and lead conversion rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Calls", value: "0", icon: PhoneCall, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Interested", value: "0", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Not Interested", value: "0", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Call Again", value: "0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-[#111827]">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111827] mb-6">Leaderboard - Week</h3>
          <div className="space-y-4">
            {telecallers.map((tc, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <span className="text-lg font-black text-[#4F46E5]">#{i + 1}</span>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB] font-bold">
                   {tc.name ? tc.name[0] : "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111827]">{tc.name}</p>
                  <p className="text-xs text-[#6B7280]">{tc.totalCallsToday || 0} Calls Today</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#10B981]">{tc.successRate || "0%"}</p>
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Success</p>
                </div>
              </div>
            ))}
            {telecallers.length === 0 && !loading && (
              <div className="py-12 text-center text-[#9CA3AF] font-bold">No telecallers found.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111827] mb-6">Daily Target Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-32 h-32 rounded-full border-[12px] border-[#F3F4F6] border-t-[#4F46E5] flex items-center justify-center relative">
               <span className="text-2xl font-black text-[#111827]">0%</span>
            </div>
            <p className="mt-6 text-sm font-bold text-[#111827]">Average Completion Rate</p>
            <p className="text-xs text-[#6B7280]">Target: 150 calls / day</p>
          </div>
        </div>
      </div>
    </div>
  );
}

