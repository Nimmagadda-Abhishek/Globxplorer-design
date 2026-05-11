import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  IdCard,
  Plane
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { visaAgentApi } from "../../../lib/api";

export function CreateClientPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    country: "",
    passport: "",
    aadhar: "",
    visaType: "",
    cutOffDates: "",
    locationPriority: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await visaAgentApi.clients.create(formData);
      if (res.success || res.data) {
        setSuccess(true);
        setTimeout(() => navigate('/visa-agent/clients'), 2000);
      }
    } catch (err) {
      console.error("Create client error:", err);
    } finally {
      setLoading(false);
    }
  };

  const countries = ["USA", "Canada", "UK", "Australia", "Germany", "France", "Japan"];
  const visaTypes = ["F1", "B1", "B2", "B1/B2", "H1B", "F2", "H4"];

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[40px] border border-[#E5E7EB] shadow-2xl shadow-emerald-100/50 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-[#111827]">Client Created!</h2>
          <p className="text-gray-500 font-medium mt-2">The visa client has been successfully registered and access credentials generated.</p>
          <div className="mt-8 space-y-3">
             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">GXVC ID Generated</p>
                <p className="text-sm font-black text-emerald-900 mt-1">GXVC_{Math.floor(1000 + Math.random() * 9000)}</p>
             </div>
             <button 
               onClick={() => navigate('/visa-agent/clients')}
               className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all"
             >
               View Pipeline
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#111827] transition-colors mb-6 group"
        >
          <div className="p-2 bg-white rounded-xl border border-[#E5E7EB] group-hover:border-gray-300 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-xl overflow-hidden">
          <div className="bg-[#111827] p-8 lg:p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="relative z-10">
               <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Quick Create Client</h1>
               <p className="text-gray-400 font-medium mt-2 max-w-lg">Register a new visa client to begin their application process and tracking pipeline.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        required
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="e.g. Amit Sharma"
                        className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="amit@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Contact Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        required
                        type="tel" 
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        placeholder="9999999999"
                        className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visa Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-500" />
                  Visa & Passport Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Passport Number</label>
                      <div className="relative">
                        <IdCard className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          required
                          type="text" 
                          value={formData.passport}
                          onChange={(e) => setFormData({...formData, passport: e.target.value})}
                          placeholder="N1234567"
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Aadhar / National ID</label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          required
                          type="text" 
                          value={formData.aadhar}
                          onChange={(e) => setFormData({...formData, aadhar: e.target.value})}
                          placeholder="XXXX-XXXX"
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Target Country</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                        <select 
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm appearance-none"
                        >
                          <option value="">Select Country</option>
                          {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Visa Type</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                        <select 
                          required
                          value={formData.visaType}
                          onChange={(e) => setFormData({...formData, visaType: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm appearance-none"
                        >
                          <option value="">Select Visa</option>
                          {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Cut-off Dates / Deadline</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={formData.cutOffDates}
                    onChange={(e) => setFormData({...formData, cutOffDates: e.target.value})}
                    placeholder="e.g. Before September Intake"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Location Priority</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={formData.locationPriority}
                    onChange={(e) => setFormData({...formData, locationPriority: e.target.value})}
                    placeholder="e.g. Toronto / Vancouver"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-end gap-4 border-t border-[#F3F4F6] pt-8">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 text-sm font-black text-[#4B5563] uppercase tracking-widest hover:text-[#111827] transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={loading}
                type="submit"
                className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Register Client
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add missing FileText import from lucide-react if needed (it was used in the TSX but not in the original import list)
import { FileText, ArrowRight } from "lucide-react";
