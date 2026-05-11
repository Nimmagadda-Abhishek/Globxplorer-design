import { ShieldCheck, UserCheck, Users, MapPin, DollarSign, ArrowUpRight, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddAgentModal } from "../components/modals/AddAgentModal";
import { adminApi } from "../../lib/api";

export function AgentPanelPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.agents.list();
      setAgents(res.data?.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Agent / Agent Manager</h1>
          <p className="text-sm text-[#6B7280]">Manage agent network, commissions, and business visits.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-shadow shadow-lg shadow-indigo-100"
        >
          Add New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Agents", value: agents.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Agents", value: agents.filter(a => a.status === 'active').length.toString(), icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
          { label: "Comm. Payable", value: "$0", icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Business Visits", value: "0", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-[#111827]">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-lg font-bold text-[#111827]">Agent Business Map</h3>
           <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-indigo-50 text-[#4F46E5] rounded-lg text-xs font-bold border border-indigo-100">
                Cities Covered
              </div>
           </div>
        </div>
        <div className="h-80 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#94A3B8]">Interactive Agent Map Ready</p>
            </div>
        </div>
      </div>
      <AddAgentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchAgents} />
    </div>
  );
}

