import { useState, useEffect } from "react";
import { Users, Award, Shield, ChevronRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniBrandAmbassadorPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [showApply, setShowApply] = useState(false);
  const [selectedRole, setSelectedRole] = useState("College Representative");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.brandAmbassador.getStatus().catch(() => null);
      if (res?.data) {
        setStatus(res.data);
      } else {
        setStatus(null); // No active application
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alumniApi.brandAmbassador.apply({ roleType: selectedRole, applicationDetails: 'I am highly involved in my university...' });
      alert("Application submitted successfully!");
      setShowApply(false);
      fetchStatus();
    } catch {
      alert("Failed to submit application");
    }
  };

  const roles = [
    { title: "College Representative", icon: Users, color: "blue", desc: "Represent GX at your local college." },
    { title: "Country Representative", icon: Award, color: "emerald", desc: "Be the face of GX in your destination country." },
    { title: "University Ambassador", icon: Shield, color: "violet", desc: "Lead communities within your university." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Brand Ambassador</h1>
          <p className="text-slate-500 mt-1 font-medium">Elevate your profile and lead student communities.</p>
        </div>
      </div>

      {status ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Your Application Status</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Role: <strong className="text-slate-700">{status.role || 'University Ambassador'}</strong></p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
            <Clock className="w-4 h-4" /> {status.status || 'Under Review'}
          </div>
        </div>
      ) : (
        <>
          {showApply ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Apply for Ambassador Role</h3>
              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Select Role</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {roles.map((r) => (
                      <button 
                        key={r.title}
                        type="button"
                        onClick={() => setSelectedRole(r.title)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === r.title ? 'border-violet-600 bg-violet-50' : 'border-slate-100 hover:border-violet-200'}`}
                      >
                        <r.icon className={`w-6 h-6 mb-3 ${selectedRole === r.title ? 'text-violet-600' : 'text-slate-400'}`} />
                        <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Why you?</label>
                  <textarea rows={4} className="w-full mt-1 p-4 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="Tell us about your campus involvement..."></textarea>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowApply(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" className="bg-violet-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition-colors">Submit Application</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.title} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${role.color}-100 text-${role.color}-600`}>
                    <role.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{role.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2 mb-8 flex-1">{role.desc}</p>
                  
                  <button onClick={() => { setSelectedRole(role.title); setShowApply(true); }} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 rounded-xl text-sm font-bold transition-colors">
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4">Why become an Ambassador?</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Higher commission rates (up to 20% bump)', 'Exclusive VIP events & networking', 'Featured profile placement for students', 'Official recommendation letters'].map((perk, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-violet-400" /> {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
