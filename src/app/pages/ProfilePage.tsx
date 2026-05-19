import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Camera, Award, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { amApi } from "../../lib/api";

export function ProfilePage() {
   const userName = localStorage.getItem("userName") || "Agent Manager";
   const gxId = localStorage.getItem("gxId") || "GXAM123456";
   const role = localStorage.getItem("userRole") || "AGENT_MANAGER";

   const [isEditing, setIsEditing] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [stats, setStats] = useState<any[]>([]);
   const [performance, setPerformance] = useState<any>(null);
   const [profile, setProfile] = useState<any>(null);
   const [editForm, setEditForm] = useState({ phone: "", address: "", profileImage: "" });
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      fetchProfileData();
   }, []);

   const fetchProfileData = async () => {
      try {
         const [perfRes, profRes] = await Promise.all([
            amApi.analytics.getPerformance(),
            amApi.profile.get()
         ]);
         setPerformance(perfRes.data);
         const profData = profRes.data || profRes;
         setProfile(profData);
         setEditForm({
            phone: profData.phone || "",
            address: profData.address || "",
            profileImage: profData.profileImage || ""
         });
      } catch (err) {
         console.error("Failed to fetch profile and performance data", err);
      }
   };

   const handleSave = async () => {
      setIsSaving(true);
      try {
         const res = await amApi.profile.update(editForm);
         setProfile(res.data || res);
         setIsEditing(false);
      } catch (err) {
         console.error("Failed to update profile", err);
      } finally {
         setIsSaving(false);
      }
   };

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
         const base64String = reader.result as string;
         try {
            const res = await amApi.profile.update({ profileImage: base64String });
            setProfile(res.data || res);
            setEditForm(prev => ({ ...prev, profileImage: base64String }));
         } catch (err) {
            console.error("Failed to update profile image", err);
            alert("Failed to update profile image. Please try again.");
         }
      };
      reader.readAsDataURL(file);
   };

   return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
         {/* HEADER SECTION */}
         <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <div className="px-8 pb-8 relative">
               <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
                  <div className="relative group">
                     <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-xl">
                        {profile?.profileImage || editForm.profileImage ? (
                           <img src={isEditing ? editForm.profileImage : profile.profileImage} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                           <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-3xl border border-indigo-50">
                              {(profile?.name || userName).substring(0, 2).toUpperCase()}
                           </div>
                        )}
                     </div>
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-2 bg-[#111827] text-white rounded-xl shadow-lg hover:scale-110 transition-transform z-20"
                        title="Update Profile Picture"
                     >
                        <Camera className="w-4 h-4" />
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                     />
                  </div>

                  <div className="flex-1 pb-2">
                     <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-[#111827] tracking-tight">{profile?.name || userName}</h1>
                        <span className="px-3 py-1 bg-indigo-50 text-[#4F46E5] text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                           {role.replace('_', ' ')}
                        </span>
                     </div>
                     <p className="text-sm text-[#6B7280] font-medium mt-1 flex items-center gap-2">
                        <span className="font-bold text-[#111827]">{gxId}</span>
                        <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                        {profile?.address}
                     </p>
                  </div>

                  <div className="flex gap-3 pb-2">
                     {isEditing ? (
                        <>
                           <button
                              onClick={() => setIsEditing(false)}
                              className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-xs font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all shadow-sm"
                           >
                              Cancel
                           </button>
                           <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#4338CA] transition-all shadow-lg"
                           >
                              {isSaving ? "Saving..." : "Save Profile"}
                           </button>
                        </>
                     ) : (
                        <>
                           <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-xs font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all shadow-sm"
                           >
                              <Edit2 className="w-4 h-4" />
                              Edit Profile
                           </button>

                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: INFO */}
            <div className="lg:col-span-1 space-y-8">
               <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest border-b border-[#F3F4F6] pb-4">Personal Details</h3>

                  <div className="space-y-5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                           <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Email Address</p>
                           <p className="text-sm font-bold text-[#111827]">{profile?.email || "manager@GlobXplore.com"}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                           <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Phone Number</p>
                           {isEditing ? (
                              <input
                                 className="text-sm font-bold text-[#111827] border rounded px-2 py-1 w-full max-w-[200px]"
                                 value={editForm.phone}
                                 onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              />
                           ) : (
                              <p className="text-sm font-bold text-[#111827]">{profile?.phone || "+91 98765 43210"}</p>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Location</p>
                           {isEditing ? (
                              <input
                                 className="text-sm font-bold text-[#111827] border rounded px-2 py-1 w-full max-w-[200px]"
                                 value={editForm.address}
                                 onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              />
                           ) : (
                              <p className="text-sm font-bold text-[#111827]">{profile?.address || "Bangalore, India"}</p>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                           <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Joined On</p>
                           <p className="text-sm font-bold text-[#111827]">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "12 Jan, 2024"}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                     <Award className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black mb-2 tracking-tight">Elite Manager</h4>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                     You are in the top 5% of agent managers this quarter. Keep up the great work!
                  </p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                     View Achievements
                  </button>
               </div>
            </div>

            {/* RIGHT COLUMN: PERFORMANCE & ACTIVITY */}
            <div className="lg:col-span-2 space-y-8">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                     <div key={i} className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                           <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-xl font-black text-[#111827]">{stat.value}</h4>
                     </div>
                  ))}
               </div>

               <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-8 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-green-500" />
                     Performance Growth
                  </h3>

                  <div className="space-y-8">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-[#4B5563]">Agent Recruitment Goal</span>
                           <span className="text-xs font-black text-[#111827]">{performance?.recruitmentCount || 0} / {performance?.recruitmentGoal || 20}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(performance?.recruitmentCount / performance?.recruitmentGoal * 100) || 0}%` }} />
                        </div>
                     </div>

                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-[#4B5563]">Student Conversion Rate</span>
                           <span className="text-xs font-black text-[#111827]">{performance?.conversionRate || 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-600 rounded-full" style={{ width: `${performance?.conversionRate || 0}%` }} />
                        </div>
                     </div>

                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-[#4B5563]">Follow-up Compliance</span>
                           <span className="text-xs font-black text-[#111827]">{performance?.complianceRate || 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${performance?.complianceRate || 0}%` }} />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6">Recent Accomplishments</h3>
                  <div className="space-y-4">
                     {[
                        "Successfully onboarded 'Global Education Hub' in North Area.",
                        "Achieved 100% follow-up completion for March 2024.",
                        "Facilitated 15+ student admissions in Canada universities.",
                        "Conducted area training for 5 new agents."
                     ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-default">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                           <p className="text-sm font-bold text-[#4B5563]">{item}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

