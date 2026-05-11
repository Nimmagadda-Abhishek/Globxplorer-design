import { useState, useEffect } from "react";
import { Link as LinkIcon, Search, Loader2, CheckCircle2, UserPlus, Clock } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.studentRequests.getAll().catch(() => null);
      if (res?.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAssign = async (id: string) => {
    const alumniId = prompt("Enter Alumni ID to assign:");
    if (!alumniId) return;

    try {
      await alumniManagerApi.studentRequests.assign(id, alumniId);
      alert(`Assigned alumni ${alumniId} to request ${id}`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to assign alumni.");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alumniManagerApi.studentRequests.resolve(id);
      alert(`Request ${id} marked as resolved.`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to resolve request.");
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.student || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Connect Panel</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage mentorship requests and assign alumni to students.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Bridge Requests</h3>
          </div>
          
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by student, ID, or type..."
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
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Request Info</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Alumni</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status / Wait Time</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{req.type}</p>
                      <p className="text-xs font-medium text-slate-500">{req.id} • {req.date}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-indigo-600">{req.student}</td>
                    <td className="p-4 text-sm font-bold text-teal-600">{req.alumni || "Unassigned"}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          req.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : 
                          req.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {req.status}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{req.waitTime} wait</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status !== 'Resolved' && (
                          <>
                            <button onClick={() => handleAssign(req.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Assign Alumni">
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleResolve(req.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Mark Resolved">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">
                No requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
