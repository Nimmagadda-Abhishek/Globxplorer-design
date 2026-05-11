import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Globe
} from "lucide-react";
import { studentPortalApi } from "../../lib/api";

export function AlumniRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    alumniDetails: {
      university: "",
      currentWorkingRole: "",
      livingLocation: "",
      shortBio: ""
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await studentPortalApi.alumni.register(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 font-medium mb-8">Welcome to the GlobXplorer Alumni network. Redirecting you to login...</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full animate-progress-fast"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Side: Branding & Info */}
      <div className="lg:w-1/3 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">GlobXplorer</span>
          </div>
          
          <h1 className="text-4xl font-black leading-tight mb-6">Empower the next generation of explorers.</h1>
          <p className="text-indigo-100 text-lg font-medium max-w-sm">Join our global alumni network and share your journey with aspiring students worldwide.</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest text-indigo-200">Connect</p>
              <p className="font-bold">Mentor future students</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest text-indigo-200">Grow</p>
              <p className="font-bold">Build your professional network</p>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-700 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Right Side: Form */}
      <div className="lg:w-2/3 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-2xl w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900">Alumni Registration</h2>
            <p className="text-slate-500 font-medium mt-2">Create your account to start guiding students.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Basic Information</h3>
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Alumni Details</h3>
                <div className="space-y-4">
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      name="alumniDetails.university"
                      required
                      placeholder="University Graduated From"
                      value={formData.alumniDetails.university}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      name="alumniDetails.currentWorkingRole"
                      required
                      placeholder="Current Job/Role"
                      value={formData.alumniDetails.currentWorkingRole}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      name="alumniDetails.livingLocation"
                      required
                      placeholder="Current City/Country"
                      value={formData.alumniDetails.livingLocation}
                      onChange={handleChange}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <textarea 
                    name="alumniDetails.shortBio"
                    required
                    placeholder="Short Bio - Tell students how you can help..."
                    rows={4}
                    value={formData.alumniDetails.shortBio}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>Complete Registration <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
              <p className="text-center text-slate-500 font-medium mt-6">
                Already have an account? <Link to="/login" className="text-indigo-600 font-black hover:underline">Login here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
