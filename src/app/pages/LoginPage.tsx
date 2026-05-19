import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { adminApi, authApi, studentPortalApi, alumniManagerApi } from "../../lib/api";
import {
  User,
  Lock,
  Loader2,
  Globe,
  Shield,
  Users,
  Headset,
  UserCheck,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "ADMIN" | "AGENT_MANAGER" | "ALUMNI_MANAGER" | "AGENT" | "TELECALLER" | "VISA_AGENT" | "COUNSELLOR" | "STUDENT" | "ALUMNI";

export function LoginPage() {
  const [gxId, setGxId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result: any = await authApi.login({ gxId, password });

      const data = result.data || result;
      const accessToken = data?.accessToken || result.token || result.access_token;

      if (!accessToken) {
        throw new Error("Login failed: Access token not provided.");
      }

      localStorage.setItem("token", accessToken);

      const userData = data.user || data;
      const actualRole = userData.role || role;
      localStorage.setItem("userRole", actualRole);

      if (userData) {
        localStorage.setItem("userName", userData.name || userData.fullName || "");
        localStorage.setItem("gxId", userData.gxId || "");
        localStorage.setItem("userId", userData._id || userData.id || "");
      }

      if (userData.isFirstLogin || userData.mustChangePassword) {
        toast.success("Welcome! For your security, please change your password.");
        switch (actualRole) {
          case "STUDENT":
            navigate("/student/profile");
            break;
          case "ALUMNI":
            navigate("/alumni/profile");
            break;
          case "ALUMNI_MANAGER":
            navigate("/alumni-manager/profile");
            break;
          case "VISA_AGENT":
            navigate("/visa-agent/profile");
            break;
          default:
            navigate("/settings?tab=security");
        }
      } else {
        // Unified Role-Based Redirects
        switch (actualRole) {
          case 'ADMIN':
          case 'AGENT_MANAGER':
          case 'TELECALLER':
          case 'COUNSELLOR':
            navigate('/');
            break;
          case 'AGENT':
            navigate('/');
            break;
          case 'STUDENT':
            navigate('/student');
            break;
          case 'ALUMNI':
            navigate('/alumni');
            break;
          case 'ALUMNI_MANAGER':
            navigate('/alumni-manager');
            break;
          case 'VISA_AGENT':
            navigate('/visa-agent');
            break;
          case 'VISA_CLIENT':
            navigate('/client');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your GX ID and password.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Left Panel - Premium Branding */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#0B0F19] p-12 xl:p-16 overflow-hidden">
        {/* Soft lighting effects for a high-end feel */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-cyan-500/10 via-blue-500/10 to-transparent blur-[120px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">GlobXplore</span>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 max-w-lg mt-auto mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-100 tracking-wide uppercase">CRM Platform 2.0</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.15] mb-6 tracking-[-0.02em]">
            Command your global student pipeline.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-light">
            An intelligent workspace designed specifically for elite education consultants and visa processing agents.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-sm text-slate-500">
          <span>&copy; {new Date().getFullYear()} GlobXplore</span>
          <a href="#" className="hover:text-white transition-colors duration-200">Help & Support</a>
        </div>
      </div>

      {/* Right Panel - Functional Login */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle mobile background */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-slate-50/50 pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">GlobXplore</span>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium tracking-wide">Enter your credentials to access the console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-red-700 text-sm font-medium leading-relaxed">{error}</div>
              </div>
            )}

            <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="gxId">
                GX ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <User className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="gxId"
                  name="gxId"
                  type="text"
                  required
                  value={gxId}
                  onChange={(e) => setGxId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium"
                  placeholder="e.g. GXCO123456"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-px"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm font-medium text-slate-500 space-y-3">
            <div className="pt-2 border-t border-slate-100">
              Are you an Alumnus?{" "}
              <Link to="/alumni/register" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-all font-bold">
                Join our Global Network →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

