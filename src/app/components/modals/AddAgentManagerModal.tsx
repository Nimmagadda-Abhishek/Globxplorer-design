import { useState } from "react";
import { X, User, Mail, Phone } from "lucide-react";
import { userApi } from "../../../lib/api";

interface AddAgentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function AddAgentManagerModal({ isOpen, onClose, onSubmitSuccess }: AddAgentManagerModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ gxId: string; autoPassword?: string } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccessData(null);
    setFormData({ name: "", email: "", phone: "" });
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res: any = await userApi.createAgentManager(formData);
      const data = res.data || res;
      const user = data.agentManager || data.user || data;
      
      setSuccessData({
        gxId: user.gxId || "N/A",
        autoPassword: data.password || user.password || data.autoPassword || user.autoPassword || res.autoPassword || "Check system logs"
      });

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create agent manager");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <button onClick={handleClose} className="absolute right-4 top-4 p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Manager Provisioned</h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Account created successfully. Provide these credentials to the manager.
            </p>
            
            <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 mb-6 text-left">
              <div className="mb-3">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">GX ID (Username)</span>
                <span className="text-lg font-mono font-bold text-[#111827]">{successData.gxId}</span>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB]">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">Generated Password</span>
                <span className="text-xl font-mono font-bold text-[#4F46E5] select-all">{successData.autoPassword}</span>
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
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#111827]">Add Agent Manager</h2>
            <button onClick={handleClose} className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
                    placeholder="jane@GlobXplore.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
                    placeholder="555-9876"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC]">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] disabled:opacity-50">
                {loading ? "Creating..." : "Create Manager"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

