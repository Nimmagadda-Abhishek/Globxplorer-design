import { useState, useEffect } from "react";
import { 
  PhoneCall, 
  Clock, 
  UserPlus, 
  History, 
  MoreVertical, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";
import { leadApi } from "../../lib/api";

export function QueuePage() {
  const [activeTab, setActiveTab] = useState<"new" | "missed" | "old">("new");
  const [queue, setQueue] = useState({
    newLeads: [],
    missedFollowups: [],
    oldLeads: []
  });
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res: any = await leadApi.getLeadQueue();
      const data = res.data || res;
      let newLeads = data.newLeads || [];
      let missedFollowups = data.missedFollowups || [];
      let oldLeads = data.oldLeads || [];

      // If the backend returned a flat array, we filter it locally
      if (Array.isArray(data)) {
        newLeads = data.filter((l: any) => !l.status || l.status === "New");
        
        missedFollowups = data.filter((l: any) => {
          if (l.status === "Call not answered") return true;
          if (l.status === "Follow-up scheduled" && l.followUpDate) {
            return new Date(l.followUpDate).getTime() < new Date().getTime();
          }
          return false;
        });

        oldLeads = data; // Total Queue shows all leads
      }

      setQueue({
        newLeads,
        missedFollowups,
        oldLeads
      });
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveList = () => {
    if (activeTab === "new") return queue.newLeads;
    if (activeTab === "missed") return queue.missedFollowups;
    return queue.oldLeads;
  };

  const handleOpenLog = (lead: any) => {
    setSelectedLead(lead);
    setShowLogModal(true);
  };

  if (loading) return <div className="p-6">Loading your work queue...</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1 text-left">Telecaller Queue</h1>
          <p className="text-sm text-[#6B7280]">Manage your incoming leads and follow-up sequence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search in queue..."
              className="pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-full sm:w-64"
            />
          </div>
          <button className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-[#4B5563]" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("new")}
          className={`p-4 rounded-xl border transition-all text-left ${activeTab === "new" ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-[#E5E7EB] hover:border-indigo-200'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${activeTab === "new" ? 'bg-indigo-600' : 'bg-[#F3F4F6]'}`}>
              <UserPlus className={`w-5 h-5 ${activeTab === "new" ? 'text-white' : 'text-[#6B7280]'}`} />
            </div>
            <span className={`text-sm font-bold ${activeTab === "new" ? 'text-indigo-700' : 'text-[#4B5563]'}`}>Fresh Leads</span>
          </div>
          <p className="text-2xl font-black text-[#111827]">{queue.newLeads.length}</p>
        </button>

        <button 
          onClick={() => setActiveTab("missed")}
          className={`p-4 rounded-xl border transition-all text-left ${activeTab === "missed" ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-[#E5E7EB] hover:border-red-200'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${activeTab === "missed" ? 'bg-red-600' : 'bg-[#F3F4F6]'}`}>
              <History className={`w-5 h-5 ${activeTab === "missed" ? 'text-white' : 'text-[#6B7280]'}`} />
            </div>
            <span className={`text-sm font-bold ${activeTab === "missed" ? 'text-red-700' : 'text-[#4B5563]'}`}>Missed Callbacks</span>
          </div>
          <p className="text-2xl font-black text-[#111827]">{queue.missedFollowups.length}</p>
        </button>

        <button 
          onClick={() => setActiveTab("old")}
          className={`p-4 rounded-xl border transition-all text-left ${activeTab === "old" ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-[#E5E7EB] hover:border-blue-200'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${activeTab === "old" ? 'bg-blue-600' : 'bg-[#F3F4F6]'}`}>
              <Clock className={`w-5 h-5 ${activeTab === "old" ? 'text-white' : 'text-[#6B7280]'}`} />
            </div>
            <span className={`text-sm font-bold ${activeTab === "old" ? 'text-blue-700' : 'text-[#4B5563]'}`}>Total Queue</span>
          </div>
          <p className="text-2xl font-black text-[#111827]">{queue.oldLeads.length}</p>
        </button>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Source & Country</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Last Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {getActiveList().length > 0 ? (
                getActiveList().map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                          {lead.name ? lead.name[0] : 'L'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111827]">{lead.name}</p>
                          <p className="text-xs text-[#6B7280]">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-[#111827] font-medium">{lead.source}</p>
                      <p className="text-xs text-[#6B7280]">{lead.country || 'Not Set'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                        {lead.status || 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5" />
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Immediate'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-xs font-bold hover:bg-[#4338CA] transition-all">
                          <Phone className="w-3.5 h-3.5" />
                          Call Now
                        </button>
                        <button 
                          onClick={() => handleOpenLog(lead)}
                          className="p-1.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-white hover:text-indigo-600 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-12 h-12 text-green-100 mb-2" />
                      <p className="text-sm font-medium text-[#6B7280]">Queue is clear for this category</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLogModal && (
        <CallLogModal 
          lead={selectedLead} 
          onClose={() => setShowLogModal(false)} 
          onSuccess={() => {
            setShowLogModal(false);
            fetchQueue();
          }} 
        />
      )}
    </div>
  );
}

function CallLogModal({ lead, onClose, onSuccess }: { lead: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    status: lead.status || "Contacted",
    notes: "",
    followUpDate: "",
    country: lead.country || "",
    course: lead.course || "",
    intake: lead.intake || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await leadApi.updateLeadStatus(lead._id, formData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E7EB]">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#111827]">Log Call: {lead.name}</h2>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Phone</label>
              <input 
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Update Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option>Contacted</option>
                <option>Call not answered</option>
                <option>Interested</option>
                <option>Not interested</option>
                <option>Follow-up scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Next Follow-up</label>
              <input 
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Call Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Summary of the conversation..."
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 h-24"
            />
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
              <UserPlus className="w-3 h-3" /> Lead Details
            </p>
            <div className="grid grid-cols-1 gap-3">
              <input 
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input 
                placeholder="Course (e.g. MBA)"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input 
                placeholder="Intake (e.g. 2026)"
                value={formData.intake}
                onChange={(e) => setFormData({...formData, intake: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338CA] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Updating..." : "Save Call Log"}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
