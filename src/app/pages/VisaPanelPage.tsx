import { Briefcase, CheckCircle2, Clock, XCircle, AlertCircle, Search, Calendar, MoreVertical, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function VisaPanelPage() {
  const [visaApplications, setVisaApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ds160Pending: 0,
    feePending: 0,
    slotBooked: 0,
    approved: 0,
    rejected: 0,
    urgent: 0
  });


  useEffect(() => {
    fetchVisaApplications();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.dashboard.getSummary();
      const summary = res.data || {};
      setStats({
        ds160Pending: summary.visaDs160Pending || 0,
        feePending: summary.visaFeePending || 0,
        slotBooked: summary.visaSlotBooked || 0,
        approved: summary.visaApproved || 0,
        rejected: summary.visaRefused || 0,
        urgent: summary.visaUrgent || 0
      });
    } catch (err) {
      console.error("Failed to fetch visa stats", err);
    }
  };

  const fetchVisaApplications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.visa.list();
      // Handle the data structure from the API (res.data is the array)
      const apps = Array.isArray(res.data) ? res.data : (res.data?.visaApplications || []);
      setVisaApplications(apps);
    } catch (err) {
      console.error("Failed to fetch visa applications:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Visa Panel</h1>
        <p className="text-sm text-[#6B7280]">Manage visa applications, slots, and approvals.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "DS-160 Pending", value: stats.ds160Pending.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Fee Pending", value: stats.feePending.toString(), color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Slot Booked", value: stats.slotBooked.toString(), color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Approved", value: stats.approved.toString(), color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: stats.rejected.toString(), color: "text-red-600", bg: "bg-red-50" },
          { label: "Urgent", value: stats.urgent.toString(), color: "text-pink-600", bg: "bg-pink-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <p className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className={`text-xl font-black ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>


      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between">
           <h3 className="text-sm font-bold text-[#111827]">Active Visa Cases</h3>
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold animate-pulse">
               <AlertCircle className="w-3 h-3" />
               {stats.urgent} cases need attention

             </div>
           </div>
        </div>
        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
            </div>
          )}
          <table className="w-full text-left">

            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Country/Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">DS-160 / Payment</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Current Stage</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {visaApplications.map((app, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-[#111827]">{app.linkedUser?.name || app.name || 'Unknown'}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-tighter">{app.clientId || app.gxvcId || 'ID Pending'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-[#374151]">{app.country || 'N/A'}</p>
                    <p className="text-[10px] text-[#6B7280]">{app.visaType || app.type || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${app.ds160Status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            <div className={`w-1 h-1 rounded-full ${app.ds160Status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            DS-160: {app.ds160Status || 'Pending'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${app.paymentTypes?.portalFeeStatus === 'Paid' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                            <div className={`w-1 h-1 rounded-full ${app.paymentTypes?.portalFeeStatus === 'Paid' ? 'bg-blue-600' : 'bg-red-600'}`} />
                            Fee: {app.paymentTypes?.portalFeeStatus || 'Unpaid'}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        app.manualStatus === 'Done' ? 'bg-blue-500 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {app.manualStatus === 'Done' ? 'COMPLETED' : (app.stage?.replace(/_/g, ' ') || 'ACTIVE')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
                      <Clock className={`w-3.5 h-3.5 ${app.status === 'Urgent' ? 'text-red-500' : 'text-[#9CA3AF]'}`} />
                      <span className={app.status === 'Urgent' ? 'text-red-600 font-bold' : ''}>{app.cutOffDates || app.deadline || 'No Deadline'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-[#9CA3AF] hover:text-[#111827] rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
