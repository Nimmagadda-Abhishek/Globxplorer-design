import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Search, RefreshCw, User } from "lucide-react";
import { adminApi } from "../../lib/api";
import { toast } from "sonner";

export function StudentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.students.getPendingRegistrations();
      if (res.success && res.data) {
        setRegistrations(res.data);
      } else {
        setRegistrations([]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this student? This will create an account and generate credentials.")) return;
    
    setActionLoading(id);
    try {
      const res: any = await adminApi.students.approveStudent(id);
      if (res.success || res.message) {
        toast.success("Student approved successfully!");
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve student");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled
    
    setActionLoading(id);
    try {
      const res: any = await adminApi.students.rejectStudent(id, reason);
      if (res.success || res.message) {
        toast.success("Student registration rejected.");
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject student");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone?.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pending Registrations</h1>
          <p className="text-slate-500 font-medium mt-1">Review and approve new student applications.</p>
        </div>
        <button 
          onClick={fetchRegistrations}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            Total Pending: <span className="text-indigo-600">{registrations.length}</span>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          {loading && registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading pending registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">All caught up!</h3>
              <p className="text-slate-500 font-medium max-w-sm">There are no pending student registrations to review at this time.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Preferences</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                          {reg.fullName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{reg.fullName}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">Applied: {new Date(reg.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{reg.email}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{reg.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold w-fit">
                          {reg.interestedCountry}
                        </span>
                        <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]" title={reg.interestedProgram}>
                          {reg.interestedProgram}
                        </span>
                        {reg.loanStatus && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                            Loan: {reg.loanStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleReject(reg._id)}
                          disabled={actionLoading === reg._id}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(reg._id)}
                          disabled={actionLoading === reg._id}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm shadow-indigo-200"
                        >
                          {actionLoading === reg._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
