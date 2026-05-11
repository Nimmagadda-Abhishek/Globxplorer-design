import { 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { visaClientApi } from "../../../lib/api";

export function ClientLoginPage() {
  const navigate = useNavigate();
  const [gxvcId, setGxvcId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await visaClientApi.auth.login(gxvcId, password);
      if (res.token || res.data?.token) {
        navigate('/client');
      } else {
        setError("Invalid credentials. Please check your GXVC ID and password.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-2xl shadow-gray-200 overflow-hidden">
          <div className="bg-[#111827] p-10 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
             <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 rotate-12 group-hover:rotate-0 transition-transform">
                   <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-white tracking-tight">Visa Client Access</h1>
                   <p className="text-gray-400 text-xs font-medium mt-1">Track your visa application progress securely.</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                 <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                 <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">GXVC ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    required
                    type="text" 
                    value={gxvcId}
                    onChange={(e) => setGxvcId(e.target.value)}
                    placeholder="e.g. GXVC_1234"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Secure Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-6 border-t border-[#F3F4F6] text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                 End-to-End Encrypted Session
               </p>
            </div>
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-xs font-medium mt-8">
          Having trouble? <a href="#" className="text-emerald-600 font-bold hover:underline">Contact your Visa Agent</a>
        </p>
      </div>
    </div>
  );
}
