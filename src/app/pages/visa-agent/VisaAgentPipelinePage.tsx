import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { visaAgentApi } from "../../../lib/api";

const stages = [
  { id: "client_created", name: "Client Created", color: "bg-slate-500" },
  { id: "ds160_pending", name: "DS160 Pending", color: "bg-blue-500" },
  { id: "ds160_submitted", name: "DS160 Submitted", color: "bg-indigo-500" },
  { id: "payment_pending", name: "Payment Pending", color: "bg-amber-500" },
  { id: "payment_completed", name: "Payment Completed", color: "bg-emerald-500" },
  { id: "slot_monitoring", name: "Slot Monitoring", color: "bg-purple-500" },
  { id: "slot_booked", name: "Slot Booked", color: "bg-pink-500" },
  { id: "approved", name: "Visa Approved", color: "bg-green-500" },
];

export function VisaAgentPipelinePage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await visaAgentApi.clients.list();
      const clientsData = res.data?.clients || (Array.isArray(res.data) ? res.data : []);
      setClients(clientsData);
    } catch (err) {
      console.error("Failed to fetch pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    c.linkedUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.clientId?.toLowerCase().includes(search.toLowerCase()) ||
    c.gxvcId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Lead Pipeline</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Track and manage every client from creation to visa approval.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/visa-agent/clients/create')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-2xl text-sm font-black text-white hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] border border-[#E5E7EB] shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search clients in pipeline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button className="px-6 py-3 text-xs font-black text-[#374151] border border-[#E5E7EB] rounded-2xl hover:bg-gray-50 flex items-center gap-2 uppercase tracking-widest">
          <Filter className="w-4 h-4 text-[#9CA3AF]" />
          Filters
        </button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        )}
        <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Client ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Full Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Country & Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredClients.map((client) => (
                  <tr 
                    key={client._id} 
                    onClick={() => navigate(`/visa-agent/clients/${client._id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-6 text-xs font-black text-[#6B7280] tracking-widest uppercase">{client.clientId || client.gxvcId || client._id.slice(-8)}</td>
                    <td className="px-8 py-6 text-sm font-black text-[#111827]">{client.fullName || client.linkedUser?.name || 'Unknown'}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-[10px] font-black text-[#374151] uppercase tracking-widest">
                          {client.country}
                        </span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          {client.visaType}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${stages.find(s => s.id === (client.stage || client.status || 'client_created'))?.color || "bg-gray-300"} rounded-full`} />
                        <span className="text-[10px] font-black text-[#111827] uppercase tracking-widest">
                          {stages.find(s => s.id === (client.stage || client.status || 'client_created'))?.name || client.stage || client.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
