import { Search, Plus, Filter, MoreVertical, LayoutGrid, List as ListIcon, ChevronRight, User, Loader2, Globe, FileText, CreditCard, CalendarCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { visaAgentApi } from "../../../lib/api";

const stages = [
  { id: "client_created", name: "Client Created", color: "bg-slate-500", icon: User },
  { id: "ds160_pending", name: "DS160 Pending", color: "bg-blue-500", icon: FileText },
  { id: "ds160_submitted", name: "DS160 Submitted", color: "bg-indigo-500", icon: FileText },
  { id: "payment_pending", name: "Payment Pending", color: "bg-amber-500", icon: CreditCard },
  { id: "payment_completed", name: "Payment Completed", color: "bg-emerald-500", icon: CreditCard },
  { id: "slot_monitoring", name: "Slot Monitoring", color: "bg-purple-500", icon: Globe },
  { id: "slot_booked", name: "Slot Booked", color: "bg-pink-500", icon: CalendarCheck },
  { id: "approved", name: "Visa Approved", color: "bg-green-500", icon: CalendarCheck },
];

export function VisaAgentPipelinePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"kanban" | "table">("kanban");
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
          <div className="flex bg-white p-1 border border-[#E5E7EB] rounded-2xl shadow-sm">
            <button
              onClick={() => setView("kanban")}
              className={`p-2.5 rounded-xl transition-all ${view === "kanban" ? "bg-[#111827] text-white shadow-lg" : "text-[#6B7280] hover:bg-gray-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2.5 rounded-xl transition-all ${view === "table" ? "bg-[#111827] text-white shadow-lg" : "text-[#6B7280] hover:bg-gray-50"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
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
        {view === "kanban" ? (
          <div className="flex gap-6 h-full pb-4 min-w-max">
            {stages.map((stage) => (
              <div key={stage.id} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${stage.color} rounded-full`} />
                    <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-[0.2em]">{stage.name}</h3>
                  </div>
                  <span className="text-[10px] font-black text-[#9CA3AF] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-full">
                    {filteredClients.filter(c => (c.status || 'client_created') === stage.id).length}
                  </span>
                </div>
                <div className="flex-1 bg-gray-50/50 rounded-[32px] border border-[#E5E7EB] p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {filteredClients.filter(c => (c.stage || c.status || 'client_created') === stage.id).map((client) => (
                    <div 
                      key={client._id} 
                      onClick={() => navigate(`/visa-agent/clients/${client._id}`)}
                      className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#9CA3AF] tracking-[0.1em] uppercase">{client.clientId || client.gxvcId || 'PENDING ID'}</span>
                        <MoreVertical className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827]" />
                      </div>
                      <h4 className="text-sm font-black text-[#111827] mb-1">{client.fullName || client.linkedUser?.name || 'Unknown'}</h4>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-emerald-100">{client.country}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">{client.visaType}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#6B7280]" />
                          </div>
                          <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-tighter">{client.passport || 'NO PASSPORT'}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                  {filteredClients.filter(c => (c.stage || c.status || 'client_created') === stage.id).length === 0 && (
                     <div className="h-24 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Clients</p>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
