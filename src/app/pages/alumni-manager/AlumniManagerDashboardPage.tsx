import { 
  Users, 
  UserPlus, 
  Briefcase, 
  DollarSign, 
  Link as LinkIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  ChevronRight,
  Eye,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    openServiceRequests: 0,
    revenueThisMonth: "₹0",
    studentsConnected: 0
  });

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [connectRequests, setConnectRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch dashboard data
        const [summaryRes, regRes, srvRes, connRes] = await Promise.all([
          alumniManagerApi.dashboard.getSummary().catch(() => null),
          alumniManagerApi.registrations.getAll().catch(() => null),
          alumniManagerApi.services.getRequests().catch(() => null),
          alumniManagerApi.studentRequests.getAll().catch(() => null)
        ]);

        if (summaryRes?.data) setStats(summaryRes.data);
        if (regRes?.data) setRegistrations(regRes.data.slice(0, 5));
        if (srvRes?.data) setServiceRequests(srvRes.data.slice(0, 5));
        if (connRes?.data) setConnectRequests(connRes.data.slice(0, 5));

      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    if (!id) {
      console.error("Attempted to approve a registration with no ID");
      alert("Invalid registration ID.");
      return;
    }
    try {
      await alumniManagerApi.registrations.approveAlumni(id);
      alert(`Registration ${id} approved.`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    if (!id) {
      alert("Invalid registration ID.");
      return;
    }
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await alumniManagerApi.registrations.reject(id, reason);
      alert(`Registration ${id} rejected.`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to reject.");
    }
  };

  const displayRegs = registrations;
  const displayConnect = connectRequests;
  const displayServices = serviceRequests;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Manager Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Overview of alumni network, connections, and monetization.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Registrations", value: stats.totalRegistrations || 0, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Pending Approvals", value: stats.pendingApprovals || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Active Users", value: stats.activeUsers || 0, icon: Users, color: "text-green-600", bg: "bg-green-100" },
          { label: "Open Services", value: stats.openServiceRequests || 0, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Revenue (MTD)", value: stats.revenueThisMonth || "₹0", icon: DollarSign, color: "text-teal-600", bg: "bg-teal-100" },
          { label: "Students Connected", value: stats.studentsConnected || 0, icon: LinkIcon, color: "text-indigo-600", bg: "bg-indigo-100" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Section 1: Alumni Registrations */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900">Alumni Registrations</h3>
            <Link to="/alumni-manager/registrations" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Alumni</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">University</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Docs</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRegs.map((reg, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="py-4">
                      <p className="text-sm font-black text-slate-900">{reg.name}</p>
                      <p className="text-xs font-medium text-slate-500">{reg.id}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-700">{reg.university}</p>
                      <p className="text-xs font-medium text-slate-500">{reg.country} • {reg.year}</p>
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{reg.docs}</span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        reg.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {reg.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Student Connect Panel */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900">Student Connect Panel</h3>
            <Link to="/alumni-manager/students" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Request</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Student & Alumni</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Wait Time</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayConnect.map((req, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="py-4">
                      <p className="text-sm font-black text-slate-900">{req.type}</p>
                      <p className="text-xs font-medium text-slate-500">{req.id}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-indigo-600">S: {req.student}</p>
                      <p className="text-sm font-bold text-teal-600">A: {req.alumni || "Unassigned"}</p>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-600">{req.waitTime}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Message">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 4: Service Requests */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Service Requests</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Paid and free services requested by students.</p>
          </div>
          <Link to="/alumni-manager/service-requests" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-4 py-2 rounded-xl">
            Manage Services
          </Link>
        </div>
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
              {displayServices.map((srv, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-sm font-bold text-slate-500">{srv.id}</td>
                  <td className="p-4 text-sm font-black text-slate-900">{srv.type}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-700">{srv.student}</p>
                    <p className="text-xs font-medium text-teal-600 flex items-center gap-1 mt-0.5"><LinkIcon className="w-3 h-3"/> {srv.alumni}</p>
                  </td>
                  <td className="p-4 text-sm font-black text-slate-900">{srv.cost}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                        {srv.status}
                      </span>
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                        {srv.payment}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">Review & Approve</button>
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
