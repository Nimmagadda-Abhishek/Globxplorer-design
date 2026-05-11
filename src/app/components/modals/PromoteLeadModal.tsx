import { X, Loader2, ArrowUpRight, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { leadApi } from "../../../lib/api";

interface PromoteLeadModalProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PromoteLeadModal({ isOpen, leadId, onClose, onSuccess }: PromoteLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{ gxId: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    status: "Interested",
    country: "",
    budgetRange: "",
    percentage: "",
  });

  if (!isOpen || !leadId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res: any = await leadApi.updateLeadStatus(leadId, formData);
      if (res.success && res.data?.credentials) {
        setCredentials(res.data.credentials);
        if (onSuccess) onSuccess();
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to promote lead.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalClose = () => {
    setCredentials(null);
    onClose();
  };

  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-emerald-100 animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center relative">
            <div className="absolute top-4 right-4">
              <button onClick={handleFinalClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Student Promoted!</h2>
            <p className="text-emerald-50 text-sm opacity-90">Account created successfully with the following credentials</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Student GXID</label>
                <p className="text-xl font-black text-emerald-900 tracking-tight">{credentials.gxId}</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Temporary Password</label>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">{credentials.password}</p>
                  <button 
                    onClick={() => copyToClipboard(credentials.password)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <div className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5">
                <X className="w-5 h-5 rotate-45" />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Please share these credentials with the student. They will be required to change their password upon first login.
              </p>
            </div>

            <button
              onClick={handleFinalClose}
              className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-100" />
              Promote to Student
            </h2>
            <p className="text-emerald-100 text-xs mt-1">Capture final assessment metrics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form id="promote-lead-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Promotion Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Interested">Interested</option>
                <option value="Qualified">Qualified</option>
                <option value="Ready to Apply">Ready to Apply</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Target Country *</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. UK, Canada, Australia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Budget Range *</label>
              <input
                type="text"
                required
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. $20k - $30k"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Academic Percentage / GPA *</label>
              <input
                type="text"
                required
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 85%"
              />
            </div>
          </form>
        </div>

        <div className="bg-[#F8FAFC] border-t border-[#E5E7EB] p-4 sm:p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#E5E7EB] bg-white rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          <button
            form="promote-lead-form"
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Promote to Student
          </button>
        </div>
      </div>
    </div>
  );
}
