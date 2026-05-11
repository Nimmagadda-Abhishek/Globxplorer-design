import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Globe, 
  Plane, 
  MapPin, 
  CreditCard, 
  Calendar,
  ChevronRight,
  Bell,
  Download,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { visaClientApi } from "../../../lib/api";

export function ClientDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, pipelineRes, checklistRes] = await Promise.all([
        visaClientApi.auth.me(),
        visaClientApi.pipeline.get(),
        visaClientApi.documents.getChecklist()
      ]);
      
      setProfile(profileRes.data || profileRes);
      setPipeline(pipelineRes.data || []);
      setChecklist(checklistRes.data || []);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  const stages = [
    { label: "Client Created", status: "completed" },
    { label: "DS160 Pending", status: "completed" },
    { label: "DS160 Submitted", status: "active" },
    { label: "Portal Login Created", status: "pending" },
    { label: "Payment Pending", status: "pending" },
    { label: "Slot Monitoring", status: "pending" },
    { label: "Slot Booked", status: "pending" },
    { label: "Interview", status: "pending" },
    { label: "Approved", status: "pending" },
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Welcome Header */}
      <div className="bg-[#111827] p-8 lg:p-12 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-gray-200">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Welcome, {profile?.fullName || 'Client'}!</h1>
               <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                     <IdCard className="w-4 h-4" />
                     ID: {profile?.gxvcId || 'GXVC_PENDING'}
                  </div>
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest">
                     <Plane className="w-4 h-4" />
                     {profile?.country || 'USA'} • {profile?.visaType || 'F1'} Visa
                  </div>
               </div>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Application Status</p>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black uppercase">Processing Documents</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Progress Column */}
         <div className="lg:col-span-2 space-y-8">
            {/* Pipeline Visualizer */}
            <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
               <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Application Roadmap
               </h3>
               <div className="relative flex flex-col gap-6">
                  <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-gray-100" />
                  {stages.map((stage, i) => (
                    <div key={i} className="flex items-start gap-6 relative z-10">
                       <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                         stage.status === 'completed' ? 'bg-emerald-500' :
                         stage.status === 'active' ? 'bg-blue-500 animate-pulse' :
                         'bg-gray-200'
                       }`}>
                         {stage.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                       </div>
                       <div className="flex-1 flex items-center justify-between">
                          <p className={`text-sm font-black ${stage.status === 'pending' ? 'text-gray-400' : 'text-[#111827]'}`}>{stage.label}</p>
                          {stage.status === 'active' && (
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">In Progress</span>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Document Checklist */}
            <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Required Documents
                  </h3>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">4 Items Pending</span>
               </div>
               
               <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Passport Scan', status: 'verified' },
                    { label: 'Financial Statement', status: 'pending' },
                    { label: 'Admission Letter', status: 'verified' },
                    { label: 'DS-160 Confirmation', status: 'pending' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-3xl border border-[#F3F4F6] bg-[#F9FAFB] hover:border-blue-200 transition-all group">
                       <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            item.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                             <FileText className="w-5 h-5" />
                          </div>
                          {item.status === 'verified' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}
                       </div>
                       <p className="text-xs font-black text-[#111827]">{item.label}</p>
                       <p className={`text-[9px] font-black uppercase mt-1 tracking-widest ${
                         item.status === 'verified' ? 'text-emerald-600' : 'text-orange-600'
                       }`}>
                         {item.status}
                       </p>
                    </div>
                  ))}
               </div>
               
               <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-black text-xs uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Other Documents
               </button>
            </div>
         </div>

         {/* Right Column - Actions & Notifications */}
         <div className="space-y-8">
            {/* Urgent Alerts */}
            <div className="bg-red-600 p-8 rounded-[40px] text-white shadow-xl shadow-red-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <AlertCircle className="w-5 h-5" />
                     </div>
                     <h4 className="text-lg font-black tracking-tight">Action Required</h4>
                  </div>
                  <p className="text-red-100 text-sm font-medium leading-relaxed">
                     Your DS-160 form is ready for review. Please verify the details before final submission.
                  </p>
                  <button className="w-full mt-6 py-3 bg-white text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all">
                     Verify Form Now
                  </button>
               </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
               <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6">Quick Actions</h3>
               <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group">
                     <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Pay Visa Fee</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group">
                     <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Slot Preferences</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all group">
                     <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Guide Book</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            {/* Support Box */}
            <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Bell className="w-8 h-8 text-gray-300" />
               </div>
               <h4 className="text-sm font-black text-[#111827] uppercase tracking-widest">Need Assistance?</h4>
               <p className="text-gray-500 text-xs font-medium mt-2 leading-relaxed">
                  Your dedicated agent is available for any queries regarding your application.
               </p>
               <button className="mt-6 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] hover:gap-3 flex items-center justify-center gap-2 w-full transition-all">
                  Chat with Agent
                  <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

import { IdCard, Plus } from "lucide-react";
