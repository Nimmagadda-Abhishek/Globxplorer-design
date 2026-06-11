import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, BarChart3, Trash2, Loader2, ChevronDown, CheckCircle2 } from "lucide-react";
import { AddAgentModal } from "../components/modals/AddAgentModal";
import { Link } from "react-router";
import { amApi, userApi } from "../../lib/api";

const STATUS_OPTIONS = [
  { value: "not_visited", label: "Not Visited", color: "text-slate-600 bg-slate-50" },
  { value: "closed", label: "Closed", color: "text-gray-600 bg-gray-50" },
  { value: "revisit", label: "Revisit", color: "text-orange-600 bg-orange-50" },
  { value: "confirmed", label: "Confirmed", color: "text-indigo-600 bg-indigo-50" },
  { value: "partnered", label: "Partnered", color: "text-green-600 bg-green-50" }
];

export function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalConversions: 0, avgConversionRate: 0 });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ gxId: string; autoPassword?: string; message?: string } | null>(null);

  const role = localStorage.getItem("userRole") || "ADMIN";
  const isAM = role === "AGENT_MANAGER";
  const isAdmin = role === "ADMIN";

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res: any = isAM
        ? await amApi.agents.list({ search: searchTerm })
        : await userApi.getAgents();

      const responseData = res.data || res;
      const rawAgents = Array.isArray(responseData) ? responseData : (responseData.agents || []);
      setAgents(rawAgents);

      if (responseData && !Array.isArray(responseData)) {
        setStats({
          totalAgents: responseData.totalAgents || rawAgents.length,
          activeAgents: responseData.activeAgents || rawAgents.filter((a: any) => (a.agentDetails?.agentStatus || a.status) === 'confirmed').length,
          totalConversions: responseData.totalConversions || rawAgents.reduce((sum: number, a: any) => sum + (Number(a.converted) || 0), 0),
          avgConversionRate: responseData.avgConversionRate || 0
        });
      } else {
        setStats({
          totalAgents: rawAgents.length,
          activeAgents: rawAgents.filter((a: any) => (a.agentDetails?.agentStatus || a.status) === 'confirmed').length,
          totalConversions: rawAgents.reduce((sum: number, a: any) => sum + (Number(a.converted) || 0), 0),
          avgConversionRate: 0
        });
      }
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res: any = await amApi.agents.updateStatus(id, status);
      const data = res.data || res;

      if (data.generatedPassword) {
        setSuccessData({
          gxId: data.gxId || id,
          autoPassword: data.generatedPassword,
          message: "Agent has been confirmed and provisioned successfully!"
        });
      }

      fetchAgents();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      try {
        await userApi.deleteUser(id);
        fetchAgents();
      } catch (err) {
        console.error("Failed to delete agent", err);
        alert("Failed to delete agent. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Agents</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage your team of education consultants</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total Agents</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.totalAgents}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.activeAgents}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Avg Conversion Rate</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.avgConversionRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total Conversions</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.totalConversions}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search agents by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id || agent.gxId} className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {(agent.agentDetails?.businessName || agent.businessName || agent.name || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{agent.agentDetails?.businessName || agent.businessName || agent.name || "Unknown"}</h3>
                  <p className="text-xs text-[#6B7280]">{agent.gxId} • {agent.name || agent.role || "AGENT"}</p>

                  {isAM ? (
                    <div className="relative mt-2">
                      <select
                        value={agent.agentDetails?.agentStatus || agent.status || "not_visited"}
                        onChange={(e) => handleStatusChange(agent._id || agent.gxId, e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-black uppercase outline-none border-none cursor-pointer transition-all ${STATUS_OPTIONS.find(opt => opt.value === (agent.agentDetails?.agentStatus || agent.status || "not_visited"))?.color || "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                    </div>
                  ) : (
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${agent.agentDetails?.agentStatus === 'confirmed' || agent.agentDetails?.agentStatus === 'partnered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {agent.agentDetails?.agentStatus || agent.status || "Pending"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Mail className="w-4 h-4" />
                <span className="truncate">{agent.email || "No Email"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Phone className="w-4 h-4" />
                {agent.phone || agent.agentDetails?.customerWhatsappNumber || "No Phone"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-lg mb-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-1">Leads</p>
                <p className="text-sm font-bold text-[#111827]">{agent.activeLeads || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-1">Students</p>
                <p className="text-sm font-bold text-[#111827]">{agent.converted || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase mb-1">Rate</p>
                <p className="text-sm font-bold text-green-600">{agent.conversionRate || "0%"}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/agents/${agent._id || agent.gxId}`}
                className="flex-1 text-center px-3 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Profile
              </Link>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(agent._id || agent.gxId)}
                  className="px-3 py-2 border border-red-100 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {agents.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
            <p className="text-sm font-bold text-[#94A3B8]">No agents found matching your search.</p>
          </div>
        )}
        {loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-indigo-600">Loading agents...</p>
          </div>
        )}
      </div>

      <AddAgentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchAgents} />

      {/* Success Modal for Provisioned Credentials */}
      {successData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-[#111827] mb-2 tracking-tight">Agent Inducted!</h2>
              <p className="text-sm text-[#6B7280] mb-8 font-medium">
                {successData.message || "The credentials have been generated and sent to the agent via WhatsApp."}
              </p>
              
              <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5 mb-8 text-left space-y-4">
                <div>
                  <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">GX ID (Username)</span>
                  <span className="text-xl font-black text-[#4F46E5] tracking-tight">{successData.gxId}</span>
                </div>
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">Temporary Password</span>
                  <span className="text-xl font-black text-[#111827] select-all">{successData.autoPassword}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSuccessData(null)}
                className="w-full px-6 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}