import { useState, useEffect } from "react";
import { Briefcase, Plus, ShieldCheck, CheckCircle2, PauseCircle, Loader2 } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.services.getAll().catch(() => null);
      console.log("Alumni Services Response:", res);
      if (res) {
        const data = res.data || res.services || res;
        const finalServices = Array.isArray(data) ? data : (data.services || []);
        setServices(finalServices);
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await alumniApi.services.updateStatus(id, newStatus);
      fetchServices();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleRequestVerification = async (id: string) => {
    try {
      await alumniApi.services.requestVerification(id);
      alert("Verification request sent to Admin.");
      fetchServices();
    } catch {
      alert("Failed to send request");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      serviceType: formData.get("serviceType"),
      price: Number(formData.get("price")),
      description: formData.get("description"),
    };

    try {
      await alumniApi.services.create(data);
      setShowAdd(false);
      alert("Service created and pending approval!");
      fetchServices();
    } catch (error) {
      console.error(error);
      alert("Failed to create service");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Services</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage the services you offer to students.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors shadow-lg shadow-violet-600/20">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Register New Service</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Service Type</label>
              <input name="serviceType" type="text" placeholder="e.g. Accommodation Help" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
              <input name="price" type="number" placeholder="799" className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
              <textarea name="description" placeholder="Describe what you will provide..." rows={3} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold">Save Service</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.status === 'Active' || srv.status === 'Accepted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                {(srv.verified || srv.status === 'Accepted') && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> Approved
                  </span>
                )}
                {srv.status === 'Pending' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    Pending
                  </span>
                )}
                {srv.status === 'Rejected' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    Rejected
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-black text-slate-900">{srv.serviceType}</h3>
              <h4 className="text-xl font-black text-violet-600 mt-1 mb-2">₹{srv.price}</h4>
              <p className="text-sm font-medium text-slate-500 flex-1">{srv.description}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => handleToggleStatus(srv._id, srv.status)}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${srv.status === 'Active' || srv.status === 'Accepted' ? 'text-green-600' : 'text-slate-400'}`}
                >
                  {(srv.status === 'Active' || srv.status === 'Accepted') ? <CheckCircle2 className="w-4 h-4"/> : <PauseCircle className="w-4 h-4" />}
                  {srv.status}
                </button>
                
                {srv.rejectionReason && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 max-w-[150px] truncate" title={srv.rejectionReason}>
                    Reason: {srv.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
