import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical, 
  Eye, 
  FileText, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Globe,
  Plane,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { visaAgentApi } from "../../../lib/api";

export function ClientsListPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const getCountryLabel = (val: string) => {
    if (!val) return 'All';
    if (val === 'uk') return 'UK';
    if (val === 'usa') return 'USA';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const currentCountry = id && window.location.pathname.includes('countries') ? getCountryLabel(id) : (searchParams.get('country') || 'All');
  const currentVisaType = id && window.location.pathname.includes('visa-type') ? id.toUpperCase().replace('-', '/') : (searchParams.get('visaType') || 'All');
  const currentStatus = searchParams.get('status') || 'All';

  useEffect(() => {
    fetchClients();
  }, [searchParams, id]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (currentCountry !== 'All') params.country = currentCountry;
      if (currentVisaType !== 'All') params.visaType = currentVisaType;
      if (currentStatus !== 'All') params.status = currentStatus;
      
      const res = await visaAgentApi.clients.list(params);
      const clientsData = res.data?.clients || (Array.isArray(res.data) ? res.data : []);
      setClients(clientsData);
    } catch (err) {
      console.error("Fetch clients error:", err);
    } finally {
      setLoading(false);
    }
  };

  const countries = ["All", "USA", "Canada", "UK", "Australia", "Germany", "France", "Japan"];
  const visaTypes = ["All", "F1", "B1", "B2", "B1/B2", "H1B", "F2", "H4"];
  const statuses = ["All", "client_created", "ds160_pending", "ds160_submitted", "payment_pending", "payment_completed", "slot_monitoring", "slot_booked", "approved", "rejected"];

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const filteredClients = clients.filter(c => 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    c.linkedUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.clientId?.toLowerCase().includes(search.toLowerCase()) ||
    c.gxvcId?.toLowerCase().includes(search.toLowerCase()) ||
    c.passport?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Visa Clients Pipeline</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Manage and track progress for all assigned visa applications.</p>
        </div>
        <button 
          onClick={() => navigate('/visa-agent/clients/create')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-[#E5E7EB] shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Name, GXVC ID or Passport..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Globe className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={currentCountry}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="pl-12 pr-10 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs appearance-none cursor-pointer"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative group">
            <Plane className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={currentVisaType}
              onChange={(e) => handleFilterChange('visaType', e.target.value)}
              className="pl-12 pr-10 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs appearance-none cursor-pointer"
            >
              {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative group">
            <Filter className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={currentStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="pl-12 pr-10 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs appearance-none cursor-pointer"
            >
              {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-xl overflow-hidden">
        <div className="overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
          )}
          
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Client Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Target & Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Processing Stage</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Payment</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredClients.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center">
                        <Users className="w-10 h-10 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-[#111827]">No clients found</h4>
                        <p className="text-gray-500 font-medium mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSearch("");
                          setSearchParams(new URLSearchParams());
                        }}
                        className="mt-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr 
                    key={client._id} 
                    className="hover:bg-gray-50/80 transition-all group cursor-pointer"
                    onClick={() => navigate(`/visa-agent/clients/${client._id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-sm">
                          {client.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#111827] group-hover:text-emerald-600 transition-colors">{client.fullName || client.linkedUser?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-[#9CA3AF] tracking-tight">{client.clientId || client.gxvcId || 'NO-ID'}</span>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span className="text-[10px] font-black text-[#9CA3AF] tracking-tight">{client.passport || 'NO-PASSPORT'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <p className="text-xs font-black text-[#374151]">{client.country || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{client.visaType || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          client.approvalStatus === 'Approved' || client.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          client.approvalStatus === 'Rejected' || client.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {client.stage?.replace(/_/g, ' ') || client.status || 'Process Started'}
                        </span>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-[60%] transition-all" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${
                           client.visaFeePaymentStatus === 'Paid' ? 'text-emerald-600' : 'text-orange-600'
                         }`}>
                           {client.visaFeePaymentStatus || 'Pending'}
                         </span>
                         <p className="text-[9px] text-[#9CA3AF] font-bold">Portal Fee: {client.paymentTypes?.portalFeeStatus || 'Pending'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                         <button className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                           <Eye className="w-4 h-4" />
                         </button>
                         <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                           <FileText className="w-4 h-4" />
                         </button>
                         <button className="p-2.5 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
                           <MoreVertical className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
