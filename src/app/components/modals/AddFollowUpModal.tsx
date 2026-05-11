import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { amApi } from "../../../lib/api";

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddFollowUpModal({ isOpen, onClose, onSuccess }: AddFollowUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetId: "",
    targetModel: "User",
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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