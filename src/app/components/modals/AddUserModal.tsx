import { X, Loader2, CheckCircle2, UserPlus, Shield } from "lucide-react";
import { useState } from "react";
import { adminApi } from "../../../lib/api";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ gxId: string; autoPassword?: string; message?: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "TELECALLER",
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccessData(null);
    setFormData({ name: "", email: "", phone: "", role: "TELECALLER" });
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;
      if (formData.role === "ALUMNI_MANAGER") {
        res = await adminApi.alumniManagers.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
      } else {
        res = await adminApi.users.create(formData);
      }
      
      const data = res.data || res;
      const user = data.user || data;
      
      setSuccessData({
        gxId: user.gxId || "N/A",
        autoPassword: data.password || user.password || data.autoPassword || user.autoPassword || res.autoPassword || "Check system logs",
        message: res.message || "User created successfully"
      });
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
          <button onClick={handleClose} className="absolute right-4 top-4 p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">User Provisioned</h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Provide these auto-generated credentials to the new employee.
            </p>
            
            <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 mb-6 text-left">
              <div className="mb-3">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">GX ID (Username)</span>
                <span className="text-lg font-mono font-bold text-[#111827]">{successData.gxId}</span>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB]">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">Generated Password</span>
                <span className="text-xl font-mono font-bold text-indigo-600 select-all">{successData.autoPassword}</span>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        <div className="bg-white border-b border-[#E5E7EB] p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#4F46E5]" />
              Create New User
            </h2>
            <p className="text-[#6B7280] text-xs mt-1">Register a new system user with specific roles</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Role *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] appearance-none"
                >
                  <option value="TELECALLER">Telecaller</option>
                  <option value="AGENT_MANAGER">Agent Manager</option>
                  <option value="ALUMNI_MANAGER">Alumni Manager</option>
                  <option value="VISA_AGENT">Visa Agent</option>
                  <option value="COUNSELLOR">Counsellor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="jane@GlobXplore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="+1 234 567 890"
              />
            </div>
          </form>
        </div>

        <div className="bg-[#F8FAFC] border-t border-[#E5E7EB] p-4 sm:p-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-[#E5E7EB] bg-white rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          <button
            form="user-form"
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}

