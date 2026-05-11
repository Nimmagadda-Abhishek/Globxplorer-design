import { useState, useEffect } from "react";
import { UserPlus, CheckCircle2, XCircle, Clock, Eye, Loader2, Search, Trash2 } from "lucide-react";
import { alumniManagerApi, userApi } from "../../../lib/api";

export function AlumniRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.registrations.getPending().catch(() => null);
      if (res?.data) {
        setRegistrations(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (id: string) => {
    if (!id) {
      console.error("Attempted to approve a registration with no ID");
      alert("Invalid registration ID.");
      return;
    }
    try {
      await alumniManagerApi.registrations.approveAlumni(id);
      alert(`Registration ${id} approved successfully.`);
      fetchRegistrations(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Failed to approve registration.");
    }
  };

  const handleReject = async (id: string) => {
    if (!id) {
      alert("Invalid registration ID.");
      return;
    }
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    
    try {
      await alumniManagerApi.registrations.reject(id, reason);
      alert(`Registration ${id} rejected.`);
      fetchRegistrations(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Failed to reject registration.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this alumni registration? This action is permanent.")) {
      try {
        await userApi.deleteUser(id);
        fetchRegistrations();
      } catch (err) {
        console.error("Failed to delete registration:", err);
        alert("Failed to delete registration. Please try again.");
      }
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    (reg.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (reg.university || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Registrations</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and verify new alumni applications.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Pending Alumni Approval</h3>
          </div>
          
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Alumni Details</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Education</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{reg.name}</p>
                      <p className="text-xs font-medium text-slate-500">{reg.email} • {reg.id}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">{reg.university}</p>
                      <p className="text-xs font-medium text-slate-500">{reg.country} • {reg.year}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      {reg.date}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        reg.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {reg.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors" title="View Docs">
                          <Eye className="w-4 h-4" />
                        </button>
                        {reg.status !== 'Verified' && (
                          <>
                            <button onClick={() => handleApprove(reg.id || reg._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Approve">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReject(reg.id || reg._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(reg.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                            title="Delete Registration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">
                No registrations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
