import {
  User,
  MapPin,
  Globe,
  Camera,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  ChevronRight,
  Info,
  Loader2,
  Briefcase
} from "lucide-react";
import { useState, useEffect } from "react";
import { visaAgentApi } from "../../../lib/api";

export function VisaAgentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await visaAgentApi.me().catch(() => null);
        const data = res?.data || res;
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
            <User className="w-16 h-16 text-indigo-600" />
          </div>
          <button className="absolute bottom-0 right-0 p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg border-2 border-white hover:bg-indigo-600 transition-all">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.name || "Visa Agent"}</h1>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100 self-center md:self-auto">
              {profile?.isApproved ? "Approved Agent" : "Pending Approval"}
            </span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100 self-center md:self-auto">
              {profile?.gxId || "GX ID"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{profile?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>{profile?.phone || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visa Agent Details Section */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Agent Details</h3>
          </div>

          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MoU Status</p>
             <p className="text-sm font-bold text-slate-700 capitalize">{profile?.agentDetails?.mouStatus || "Not Completed"}</p>
          </div>
          <div className="h-px bg-slate-100"></div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agent Visit Status</p>
             <p className="text-sm font-bold text-slate-700 capitalize">
               {profile?.agentDetails?.agentStatus?.replace('_', ' ') || "N/A"}
             </p>
          </div>
          <div className="h-px bg-slate-100"></div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Active</p>
             <p className="text-sm font-bold text-slate-700 capitalize">{profile?.isActive ? "Yes" : "No"}</p>
          </div>
          <div className="h-px bg-slate-100"></div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined On</p>
             <p className="text-sm font-bold text-slate-700">
               {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
             </p>
          </div>
        </div>

        {/* Non-Editable Personal Section */}
        <div className="space-y-8">
          <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-400">Protected Information</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Legal Name</p>
                <p className="text-sm font-bold text-slate-500">{profile?.name || "N/A"}</p>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Email</p>
                <p className="text-sm font-bold text-slate-500">{profile?.email || "N/A"}</p>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-sm font-bold text-slate-500">{profile?.phone || "N/A"}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                These fields are locked as they have been verified. Contact the admin to update these.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
