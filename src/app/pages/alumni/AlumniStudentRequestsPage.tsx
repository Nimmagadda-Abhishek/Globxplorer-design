import { useState, useEffect } from "react";
import { Users, CheckCircle2, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { alumniApi } from "../../../lib/api";
import { Link } from "react-router";

export function AlumniStudentRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.communications.getRequests().catch(() => null);
      if (res?.data) {
        setRequests(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await alumniApi.communications.acceptRequest(id);
      alert("Request accepted!");
      fetchRequests();
    } catch {
      alert("Failed to accept");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await alumniApi.communications.rejectRequest(id);
      alert("Request rejected.");
      fetchRequests();
    } catch {
      alert("Failed to reject");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Requests</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage incoming mentorship and service requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Incoming Requests</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="border border-slate-100 rounded-2xl p-5 hover:border-violet-100 hover:bg-violet-50/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-lg">
                    {req.student.charAt(0)}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {req.status}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900">{req.student?.name || req.student}</h4>
                <p className="text-sm font-bold text-violet-600">{req.serviceName || req.service}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Requested on {new Date(req.createdAt || req.date).toLocaleDateString()}</p>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Fee</span>
                    <span className="text-sm font-black text-slate-900">₹{req.cost || req.amount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${req.isFundTransferred ? 'text-green-600' : 'text-amber-600'}`}>
                      {req.isFundTransferred ? 'Transferred' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {req.status === 'Pending' ? (
                    <>
                      <button onClick={() => handleAccept(req.id)} className="flex-1 bg-green-50 text-green-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleReject(req.id)} className="flex-1 bg-red-50 text-red-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <Link to="/alumni/communication" className="flex-1 bg-violet-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
