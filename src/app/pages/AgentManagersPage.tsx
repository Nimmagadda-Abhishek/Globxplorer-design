import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Mail, Phone, ShieldCheck, Trash2 } from "lucide-react";
import { userApi } from "../../lib/api";
import { AddAgentManagerModal } from "../components/modals/AddAgentManagerModal";

export function AgentManagersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";
  const fetchManagers = async () => {
    try {
      const data: any = await userApi.getAgentManagers();
      const raw = Array.isArray(data) ? data : (data.data || []);
      setManagers(raw);
    } catch (err) {
      console.error("Failed to load agent managers", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent manager? This action cannot be undone.")) {
      try {
        await userApi.deleteUser(id);
        fetchManagers();
      } catch (err) {
        console.error("Failed to delete manager", err);
        alert("Failed to delete manager. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Agent Managers</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage team leaders and their hierarchy</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Agent Manager
          </button>
        </div>
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map((manager) => (
          <div key={manager._id || manager.gxId} className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {manager.name ? manager.name.split(" ").map((n: string) => n[0]).join("").substring(0,2) : "?"}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{manager.name}</h3>
                  <p className="text-xs text-[#6B7280]">ID: {manager.gxId}</p>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {manager.role || "AGENT_MANAGER"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Mail className="w-4 h-4" />
                {manager.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Phone className="w-4 h-4" />
                {manager.phone}
              </div>
            </div>

            <div className="flex gap-2 relative mt-4">
              <Link to={`/agent-managers/${manager._id || manager.gxId}`} className="flex-1 text-center px-3 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
                View Details
              </Link>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(manager._id)}
                  className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Manager"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {managers.length === 0 && (
          <div className="col-span-full py-10 text-center text-[#6B7280] text-sm md:col-span-2 lg:col-span-3">
            No agent managers found.
          </div>
        )}
      </div>

      <AddAgentManagerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmitSuccess={fetchManagers} />
    </div>
  );
}
