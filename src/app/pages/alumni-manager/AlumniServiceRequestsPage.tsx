import { useState, useEffect } from "react";
import { Briefcase, Search, Loader2, CheckCircle2, XCircle, DollarSign, Link as LinkIcon } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniServiceRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'review' | 'all'>('review');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.services.getRequests().catch(() => null);
      if (res?.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.services.getPending().catch(() => null);
      if (res?.data) {
        setPendingServices(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const res = await alumniManagerApi.services.getAll().catch(() => null);
      if (res?.data) {
        setAllServices(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchRequests();
    } else if (activeTab === 'review') {
      fetchPendingServices();
    } else {
      fetchAllServices();
    }
  }, [activeTab]);

  const handleApproveBooking = async (id: string) => {
    try {
      await alumniManagerApi.services.approveBooking(id);
      alert(`Service booking ${id} approved.`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to approve service booking.");
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      await alumniManagerApi.services.rejectBooking(id);
      alert(`Service booking ${id} rejected.`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to reject service booking.");
    }
  };

  const handleApproveService = async (id: string) => {
    try {
      await alumniManagerApi.services.approveAlumniService(id);
      alert("Alumni service approved successfully.");
      fetchPendingServices();
    } catch (error) {
      alert("Failed to approve service.");
    }
  };

  const handleRejectService = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await alumniManagerApi.services.rejectAlumniService(id, reason);
      alert("Alumni service rejected.");
      fetchPendingServices();
    } catch (error) {
      alert("Failed to reject service.");
    }
  };

  const handleUpdateCost = async (id: string, currentCost: number) => {
    const newCost = prompt("Enter new cost:", currentCost.toString());
    if (!newCost || isNaN(Number(newCost))) return;

    try {
      await alumniManagerApi.services.updateCost(id, Number(newCost));
      alert(`Service request ${id} cost updated to ₹${newCost}.`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to update cost.");
    }
  };

  const filteredRequests = requests.filter(r =>
    (r.student || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pendingServices.filter(s =>
    (s.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.alumniId?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllServices = allServices.filter(s =>
    (s.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.alumniId?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Requests</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage paid services requested by students.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'review' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
            >
              Review Pending
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
            >
              All Services
            </button>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Request ID</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student / Alumni</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cost</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status & Payment</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((srv, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-sm font-bold text-slate-500">{srv.id}</td>
                    <td className="p-4 text-sm font-black text-slate-900">{srv.type}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">{srv.student}</p>
                      <p className="text-xs font-medium text-teal-600 flex items-center gap-1 mt-0.5"><LinkIcon className="w-3 h-3" /> {srv.alumni || "Unassigned"}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">₹{srv.cost}</span>
                        <button
                          onClick={() => handleUpdateCost(srv.id, srv.cost)}
                          className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors"
                          title="Modify Cost"
                        >
                          <DollarSign className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                          {srv.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${srv.payment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {srv.payment}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {srv.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApproveBooking(srv.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Approve">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectBooking(srv.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
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
                No service requests found.
              </div>
            )}
          </div>
        ) : activeTab === 'review' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Alumni</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((srv, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{srv.alumniId?.name}</p>
                      <p className="text-xs font-medium text-slate-500">{srv.alumniId?.gxId}</p>
                    </td>
                    <td className="p-4 text-sm font-black text-slate-900">{srv.serviceType}</td>
                    <td className="p-4 text-sm font-black text-violet-600">₹{srv.price}</td>
                    <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{srv.description}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApproveService(srv._id)} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-black hover:bg-green-100 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => handleRejectService(srv._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-black hover:bg-red-100 transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPending.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">
                No pending services for review.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Alumni</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllServices.map((srv, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{srv.alumniId?.name}</p>
                      <p className="text-xs font-medium text-slate-500">{srv.alumniId?.gxId}</p>
                    </td>
                    <td className="p-4 text-sm font-black text-slate-900">{srv.serviceType}</td>
                    <td className="p-4 text-sm font-black text-violet-600">₹{srv.price}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${srv.status === 'Accepted' || srv.status === 'Active' ? 'bg-green-100 text-green-700' :
                        srv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {srv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {srv.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApproveService(srv._id)} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-black hover:bg-green-100 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => handleRejectService(srv._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-black hover:bg-red-100 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAllServices.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">
                No alumni services found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
