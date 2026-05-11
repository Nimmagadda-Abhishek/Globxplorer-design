import { useState, useEffect } from "react";
import { User, MapPin, Briefcase, Clock, FileText, Loader2, Save } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.profile.get().catch(() => null);
      if (res?.profile) {
        setProfile(res.profile);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Backend expects the content of alumniDetails as the data argument
      const updateData = profile.alumniDetails || {};
      await alumniApi.profile.update(updateData);
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>;
  }

  const alumniDetails = profile?.alumniDetails || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your public presence and availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-center">
            <div className="w-32 h-32 bg-violet-100 text-violet-600 rounded-full mx-auto flex items-center justify-center font-black text-4xl mb-4 relative">
              {profile?.name?.charAt(0)}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{profile?.name}</h2>
            <p className="text-sm font-bold text-violet-600 mb-6">{profile?.gxId}</p>
            
            <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase">Education Background</p>
              <p className="text-sm font-black text-slate-900">{alumniDetails.university || 'N/A'}</p>
              <p className="text-sm font-medium text-slate-600">{alumniDetails.course || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-violet-600" /> Editable Profile Details
          </h3>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                  <Briefcase className="w-4 h-4" /> Current Role
                </label>
                <input 
                  type="text" 
                  value={alumniDetails.currentWorkingRole || ''} 
                  onChange={(e) => setProfile({...profile, alumniDetails: { ...alumniDetails, currentWorkingRole: e.target.value }})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                  <Clock className="w-4 h-4" /> Availability
                </label>
                <input 
                  type="text" 
                  value={alumniDetails.availability || ''} 
                  onChange={(e) => setProfile({...profile, alumniDetails: { ...alumniDetails, availability: e.target.value }})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                  <MapPin className="w-4 h-4" /> Living Location
                </label>
                <input 
                  type="text" 
                  value={alumniDetails.livingLocation || ''} 
                  onChange={(e) => setProfile({...profile, alumniDetails: { ...alumniDetails, livingLocation: e.target.value }})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                  <Briefcase className="w-4 h-4" /> Work Location
                </label>
                <input 
                  type="text" 
                  value={alumniDetails.workLocation || ''} 
                  onChange={(e) => setProfile({...profile, alumniDetails: { ...alumniDetails, workLocation: e.target.value }})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20" 
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <FileText className="w-4 h-4" /> Short Bio
              </label>
              <textarea 
                rows={4} 
                value={alumniDetails.shortBio || ''}
                onChange={(e) => setProfile({...profile, alumniDetails: { ...alumniDetails, shortBio: e.target.value }})}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20" 
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-violet-600 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-violet-700 transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
