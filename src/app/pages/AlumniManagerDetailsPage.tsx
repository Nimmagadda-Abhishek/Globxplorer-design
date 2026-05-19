import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Clock, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { adminApi } from "../../lib/api";
import { toast } from "sonner";

export function AlumniManagerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [managerRes, analyticsRes]: any = await Promise.all([
        adminApi.alumniManagers.getById(id!),
        adminApi.alumniManagers.getAnalytics(id!)
      ]);
      setManager(managerRes.data || managerRes);
      setAnalytics(analyticsRes.data || analyticsRes);
    } catch (err: any) {
      console.error("Failed to fetch manager details:", err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      await adminApi.alumniManagers.updateStatus(id!, !manager.isActive);
      toast.success(`Alumni Manager ${!manager.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-[#111827]">Manager not found</h2>
        <Link to="/alumni-managers" className="text-[#4F46E5] text-sm hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#111827]">{manager.name}</h1>
            <p className="text-sm text-[#6B7280]">Alumni Manager Profile & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleStatusToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              manager.isActive 
                ? "bg-red-50 text-red-600 hover:bg-red-100" 
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            {manager.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {manager.isActive ? "Deactivate Account" : "Activate Account"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#EEF2FF] rounded-3xl flex items-center justify-center text-[#4F46E5] font-black text-2xl mb-4">
              {manager.name.split(" ").map((n: any) => n[0]).join("")}
            </div>
            <h2 className="text-lg font-bold text-[#111827]">{manager.name}</h2>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1">
              {manager.gxId}
            </span>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#6B7280]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Email Address</p>
                <p className="font-bold text-[#374151]">{manager.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#6B7280]">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Phone Number</p>
                <p className="font-bold text-[#374151]">{manager.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#6B7280]">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">System Role</p>
                <p className="font-bold text-[#374151]">{manager.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#6B7280]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Active Since</p>
                <p className="font-bold text-[#374151]">
                  {analytics?.activeSince ? new Date(analytics.activeSince).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Lifetime</span>
              </div>
              <h3 className="text-3xl font-black text-[#111827]">{analytics?.alumniApproved || 0}</h3>
              <p className="text-sm font-bold text-[#6B7280] mt-1">Alumni Approved</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Active</span>
              </div>
              <h3 className="text-3xl font-black text-[#111827]">{analytics?.requestsHandled || 0}</h3>
              <p className="text-sm font-bold text-[#6B7280] mt-1">Requests Handled</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-lg font-bold text-[#111827]">Performance Overview</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#374151]">Approval Efficiency</span>
                  <span className="text-sm font-black text-[#4F46E5]">
                    {analytics?.requestsHandled > 0 ? Math.round((analytics.alumniApproved / analytics.requestsHandled) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-[#4F46E5] rounded-full transition-all duration-1000" 
                    style={{ width: `${analytics?.requestsHandled > 0 ? Math.min((analytics.alumniApproved / analytics.requestsHandled) * 100, 100) : 0}%` }}
                   />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-[#E5E7EB] rounded-xl">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider mb-1">Weekly Target</p>
                  <p className="text-xl font-black text-[#111827]">15 / 20</p>
                </div>
                <div className="p-4 border border-[#E5E7EB] rounded-xl">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider mb-1">System Uptime</p>
                  <p className="text-xl font-black text-[#111827]">99.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
