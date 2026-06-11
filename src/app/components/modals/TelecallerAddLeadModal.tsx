import { X, Loader2, User, Phone, Mail, UserRoundMinus, UserRoundPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { leadApi } from "../../../lib/api";
import { adminApi } from "../../../lib/api";

interface TelecallerAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Applicant = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export function TelecallerAddLeadModal({ isOpen, onClose, onSuccess }: TelecallerAddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    interest: "",
    course: "",
    source: "",
    notes: "",
  });

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  const role = localStorage.getItem("userRole") || "TELECALLER";

  const canRemoveApplicant = useMemo(() => applicants.length > 0 && selectedApplicantId !== null, [applicants, selectedApplicantId]);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSelectedApplicantId(null);
  }, [isOpen]);

  const handleAddApplicant = () => {
    const id = "APP-" + Math.random().toString(16).slice(2);
    const name = formData.name.trim() || "Applicant";
    const applicant: Applicant = {
      id,
      name,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    setApplicants((prev) => [applicant, ...prev]);
    setSelectedApplicantId(id);
  };

  const handleRemoveApplicant = () => {
    if (!canRemoveApplicant) return;
    setApplicants((prev) => prev.filter((a) => a.id !== selectedApplicantId));
    setSelectedApplicantId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The existing backend lead API expects lead fields.
      // Applicants are treated as notes/extra entries for telecaller UX.
      // If your backend supports applicants separately, wire those fields here.
      const firstApplicant = applicants[0];
      const payload = {
        name: firstApplicant?.name || formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        interest: formData.interest,
        course: formData.course,
        source: formData.source,
        notes: [formData.notes, applicants.length ? `Applicants: ${applicants.map((a) => a.name).join(", ")}` : ""]
          .filter(Boolean)
          .join("\n"),
      };

      await leadApi.createLead(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create lead.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-8 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black tracking-tight">Add Lead</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/80 text-sm font-bold">Remove/ add applicant & create a lead (no request payment)</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Course / Interest (optional)</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#111827]">Applicants</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRemoveApplicant}
                  disabled={!canRemoveApplicant}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <UserRoundMinus className="w-4 h-4" />
                  Remove applicant
                </button>
                <button
                  type="button"
                  onClick={handleAddApplicant}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-bold hover:bg-black transition-colors"
                >
                  <UserRoundPlus className="w-4 h-4" />
                  Add applicant
                </button>
              </div>
            </div>

            {applicants.length === 0 ? (
              <div className="p-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl text-sm font-medium text-[#6B7280]">
                No applicants added yet.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-[#E5E7EB] rounded-2xl">
                <div className="divide-y divide-[#E5E7EB]">
                  {applicants.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedApplicantId(a.id)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                        selectedApplicantId === a.id ? "bg-indigo-50" : "bg-white hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{a.name}</p>
                        <p className="text-[10px] font-black text-indigo-600">{a.phone || a.email || ""}</p>
                      </div>
                      {selectedApplicantId === a.id && (
                        <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#4F46E5] text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Create Lead"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

