import { useState } from "react";
import { X, Loader2, PhoneCall, UserPlus } from "lucide-react";
import { amApi, leadApi } from "../../../lib/api";

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddFollowUpModal({ isOpen, onClose, onSuccess }: AddFollowUpModalProps) {
  const isTelecaller = localStorage.getItem("userRole") === "TELECALLER";

  const [loading, setLoading] = useState(false);
  
  // AM State
  const [formData, setFormData] = useState({
    targetId: "",
    targetModel: "User",
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium",
  });

  // Telecaller State
  const [telecallerFormData, setTelecallerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Contacted",
    notes: "",
    followUpDate: "",
    country: "",
    course: "",
    intake: ""
  });

  if (!isOpen) return null;

  const handleAmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const followUpDate = new Date(`${formData.date}T${formData.time}:00Z`).toISOString();
      await amApi.followUps.create({
        targetId: formData.targetId,
        targetModel: formData.targetModel,
        title: formData.title,
        description: formData.description,
        followUpDate,
        priority: formData.priority,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create follow-up", err);
      alert("Failed to create follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleTelecallerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadApi.createLead(telecallerFormData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create lead/follow-up", err);
      alert("Failed to save follow-up");
    } finally {
      setLoading(false);
    }
  };

  if (isTelecaller) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E7EB]">
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <PhoneCall className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-[#111827]">Log Call / Follow-up</h2>
            </div>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleTelecallerSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Name *</label>
                <input 
                  type="text" required
                  value={telecallerFormData.name}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Email</label>
                <input 
                  type="email"
                  value={telecallerFormData.email}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Phone *</label>
                <input 
                  type="text" required
                  value={telecallerFormData.phone}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Update Status</label>
                <select 
                  value={telecallerFormData.status}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option>Contacted</option>
                  <option>Call not answered</option>
                  <option>Interested</option>
                  <option>Not interested</option>
                  <option>Follow-up scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Next Follow-up</label>
                <input 
                  type="date"
                  required={telecallerFormData.status === "Follow-up scheduled"}
                  value={telecallerFormData.followUpDate}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, followUpDate: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Call Notes</label>
              <textarea 
                value={telecallerFormData.notes}
                onChange={(e) => setTelecallerFormData({...telecallerFormData, notes: e.target.value})}
                placeholder="Summary of the conversation..."
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 h-24"
              />
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                <UserPlus className="w-3 h-3" /> Lead Details
              </p>
              <div className="grid grid-cols-1 gap-3">
                <input 
                  placeholder="Country"
                  value={telecallerFormData.country}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, country: e.target.value})}
                  className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <input 
                  placeholder="Course (e.g. MBA)"
                  value={telecallerFormData.course}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, course: e.target.value})}
                  className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <input 
                  placeholder="Intake (e.g. 2026)"
                  value={telecallerFormData.intake}
                  onChange={(e) => setTelecallerFormData({...telecallerFormData, intake: e.target.value})}
                  className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338CA] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : "Save Call Log"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">Add Follow-up Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleAmSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Target Type *
              </label>
              <select
                required
                value={formData.targetModel}
                onChange={(e) => setFormData({ ...formData, targetModel: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="User">Agent</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                {formData.targetModel} ID *
              </label>
              <input
                type="text"
                required
                placeholder={`Enter ${formData.targetModel} ID`}
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Follow up with ABC Travels"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Priority *
            </label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
              placeholder="Check if they received the MOU..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Adding..." : "Add Follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}