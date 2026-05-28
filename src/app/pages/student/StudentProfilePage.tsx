import {
   User,
   MapPin,
   Globe,
   School,
   Wallet,
   Camera,
   ShieldCheck,
   Lock,
   Mail,
   Phone,
   ChevronRight,
   Info,
   Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { studentPortalApi } from "../../../lib/api";

export function StudentProfilePage() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [profile, setProfile] = useState<any>(null);
   const [formData, setFormData] = useState({
      interestedCountry: "",
      preferredUni: "",
      loanStatus: "Not Required",
      address: "",
   });

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            setLoading(true);
            const res = await studentPortalApi.profile.get().catch(() => null);
            const data = res?.data || res;
            if (data) {
               setProfile(data);
               setFormData({
                  interestedCountry: data.interestedCountry || formData.interestedCountry,
                  preferredUni: data.preferredUni || formData.preferredUni,
                  loanStatus: data.loanStatus || formData.loanStatus,
                  address: data.address || formData.address,
               });
            }
         } catch (err) {
            console.error("Profile fetch error:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchProfile();
   }, []);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSave = async () => {
      try {
         setSaving(true);
         await studentPortalApi.profile.update(formData);
         alert("Profile updated successfully");
      } catch (err) {
         console.error("Profile update error:", err);
         alert("Failed to update profile");
      } finally {
         setSaving(false);
      }
   };

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
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.name || profile?.fullName || "Student Name"}</h1>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100 self-center md:self-auto">
                     Verified Student
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
            <button
               onClick={handleSave}
               disabled={saving}
               className="px-8 py-3 bg-indigo-600 text-white rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 flex items-center gap-2"
            >
               {saving && <Loader2 className="w-4 h-4 animate-spin" />}
               Save Changes
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Editable Section */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                     <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Application Preferences</h3>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Interested Country</label>
                     <select
                        name="interestedCountry"
                        value={formData.interestedCountry}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900"
                     >
                        <option>United Kingdom</option>
                        <option>USA</option>
                        <option>Canada</option>
                        <option>Australia</option>
                        <option>Ireland</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preferred University</label>
                     <input
                        type="text"
                        name="preferredUni"
                        value={formData.preferredUni}
                        onChange={handleChange}
                        placeholder="Enter University Name"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900"
                     />
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Education Loan Status</label>
                     <select
                        name="loanStatus"
                        value={formData.loanStatus}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900"
                     >
                        <option>Not Required</option>
                        <option>In Progress</option>
                        <option>Sanctioned</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correspondence Address</label>
                     <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 resize-none"
                     />
                  </div>
               </div>
            </div>

            {/* Non-Editable Section */}
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
                        <p className="text-sm font-bold text-slate-500">{profile?.name || profile?.fullName || "N/A"}</p>
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
                     <div className="h-px bg-slate-200"></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport Number</p>
                        <p className="text-sm font-bold text-slate-500">{profile?.passportNumber || "N/A"}</p>
                     </div>
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                     <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                     <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                        These fields are locked as they have been verified against your documents. Contact your counsellor to update these.
                     </p>
                  </div>
               </div>

               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900">Security Settings</h4>
                        <p className="text-xs font-medium text-slate-500">Manage password and 2FA</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
               </div>
            </div>
         </div>
      </div>
   );
}
