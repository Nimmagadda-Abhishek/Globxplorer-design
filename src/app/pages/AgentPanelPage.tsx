import { ShieldCheck, UserCheck, Users, MapPin, DollarSign, ArrowUpRight, List, Loader2, Phone, Mail, BadgeCheck, X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { AddAgentModal } from "../components/modals/AddAgentModal";
import { adminApi } from "../../lib/api";

export function AgentPanelPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAgentList, setShowAgentList] = useState(false);
  const [agentList, setAgentList] = useState<any[]>([]);
  const [agentListLoading, setAgentListLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.agents.list();
      setStats(res.data || null);
    } catch (err) {
      console.error("Failed to fetch agent stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentList = async (statusOverride?: string) => {
    const status = statusOverride !== undefined ? statusOverride : filterStatus;
    setAgentListLoading(true);
    try {
      const res = await adminApi.agents.getSummary(status ? { status } : undefined);
      setAgentList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch agent list:", err);
    } finally {
      setAgentListLoading(false);
    }
  };

  useEffect(() => {
    if (showAgentList) {
      fetchAgentList(filterStatus);
    }
  }, [filterStatus]);

  const handleListAgents = () => {
    setShowAgentList(true);
    fetchAgentList(filterStatus);
  };

  const kpis = [
    { label: "Total Agents", value: stats?.totalAgents ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Agents", value: stats?.activeAgents ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Comm. Payable", value: `₹${(stats?.commissionPayable || 0).toLocaleString()}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Business Visits", value: stats?.businessVisits ?? 0, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleListAgents}
            className="px-5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#374151] hover:bg-gray-50 flex items-center gap-2 shadow-sm"
          >
            <List className="w-4 h-4" />
            List Agents
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-shadow shadow-lg shadow-indigo-100"
          >
            Add New Agent
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-[#111827]">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Agent List Panel */}
      {showAgentList && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#111827]">Agents List</h3>
              <p className="text-xs text-[#6B7280]">All registered agents and their details</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-[#E5E7EB] rounded-lg px-3 py-1.5 outline-none font-bold text-[#374151]"
              >
                <option value="">All Statuses</option>
                <option value="not_visited">Not Visited</option>
                <option value="revisit">Revisit</option>
                <option value="confirmed">Confirmed</option>
                <option value="partnered">Partnered</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={() => setShowAgentList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative min-h-[120px]">
            {agentListLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <Loader2 className="w-7 h-7 text-[#4F46E5] animate-spin" />
              </div>
            )}
            {!agentListLoading && agentList.length === 0 && (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#9CA3AF]">No agents found</p>
              </div>
            )}
            {agentList.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {agentList.map((agent: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center font-black text-sm uppercase">
                              {agent.name?.[0] || "?"}
                            </div>
                            <div>
                              <Link to={`/agents/${agent._id || agent.gxId || agent.agentId}`} className="text-sm font-bold text-[#4F46E5] hover:underline flex items-center gap-1">
                                {agent.name || "-"}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <p className="text-[10px] font-mono text-[#6B7280]">{agent.gxId || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                              <Mail className="w-3 h-3 text-[#9CA3AF]" />
                              {agent.email || "-"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                              <Phone className="w-3 h-3 text-[#9CA3AF]" />
                              {agent.phone || "-"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            (agent.agentDetails?.agentStatus === 'confirmed' || agent.agentDetails?.agentStatus === 'partnered' || agent.status === 'confirmed')
                              ? "bg-green-50 text-green-600"
                              : (agent.agentDetails?.agentStatus === 'revisit' || agent.status === 'revisit')
                                ? "bg-orange-50 text-orange-600"
                                : "bg-gray-100 text-gray-500"
                          }`}>
                            {(agent.agentDetails?.agentStatus || agent.status || "not_visited").replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#111827]">
                          ₹{(agent.commissionEarned || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#111827]">
                          {agent.studentsCount || agent.totalStudents || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Business Map */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm min-h-[300px]">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-[#111827]">Agent Business Map</h3>
           <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-indigo-50 text-[#4F46E5] rounded-lg text-xs font-bold border border-indigo-100">
                Cities Covered
              </div>
           </div>
        </div>

        {/* Places Covered Summary */}
        {stats?.placesCoveredSummary && stats.placesCoveredSummary.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-8">
            {stats.placesCoveredSummary.map((p: any, i: number) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-lg text-xs font-bold border border-indigo-100">
                <MapPin className="w-3 h-3 inline mr-1" />{p.place || p} {p.count ? `(${p.count})` : ''}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-40 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] flex items-center justify-center mb-8">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#94A3B8]">No places covered yet</p>
            </div>
          </div>
        )}

        {/* Detailed Agent Business Mapping */}
        {stats?.agentBusinessMap && Object.values(stats.agentBusinessMap).length > 0 && (
          <div>
            <h4 className="text-sm font-black text-[#111827] mb-4">Agent Territories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(stats.agentBusinessMap).map((agent: any, i: number) => (
                <div key={agent.agentId || i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link to={`/agents/${agent.agentId || agent._id || agent.gxId}`} className="font-bold text-[#4F46E5] text-sm hover:underline flex items-center gap-1">
                        {agent.businessName || agent.agentName}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <p className="text-[10px] text-[#6B7280]">{agent.gxId} • {agent.agentName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      agent.status === 'confirmed' || agent.status === 'partnered' 
                        ? 'bg-green-100 text-green-700' 
                        : agent.status === 'revisit' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {(agent.status || 'not_visited').replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Territories Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(agent.places || []).map((p: any, j: number) => (
                        <span key={j} className="inline-flex items-center px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[10px] text-[#4B5563] font-medium">
                          <MapPin className="w-2.5 h-2.5 mr-1 text-[#4F46E5]" />
                          {p.place} {p.count > 1 ? `(${p.count})` : ''}
                        </span>
                      ))}
                      {(!agent.places || agent.places.length === 0) && (
                        <span className="text-[10px] text-[#9CA3AF] italic">No specific territories mapped</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddAgentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchStats} />
    </div>
  );
}
