import { X, Loader2, Plus, Globe, Video, MessageSquare, Image as ImageIcon, Users, Megaphone } from "lucide-react";
import { useState } from "react";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateContentModal({ isOpen, onClose, onSuccess }: CreateContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Landing Page",
    description: "",
    url: ""
  });

  if (!isOpen) return null;

  const contentTypes = [
    { name: "Landing Page", icon: Globe },
    { name: "Webinar", icon: Video },
    { name: "Ad Creative", icon: Megaphone },
    { name: "Testimonial", icon: MessageSquare },
    { name: "Gallery Item", icon: ImageIcon },
    { name: "Blog/Article", icon: Users },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#4F46E5]" />
              Create New Content
            </h2>
            <p className="text-[#6B7280] text-xs mt-1">Publish new marketing assets or landing pages</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {contentTypes.map((type) => (
              <button
                key={type.name}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.name })}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.type === type.name 
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]" 
                    : "border-gray-100 bg-white text-[#6B7280] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                }`}
              >
                <type.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-wider">{type.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#374151] mb-2 uppercase tracking-widest">Title / Name *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="e.g. Canada Fall 2026 Intake Campaign"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#374151] mb-2 uppercase tracking-widest">Target URL (Optional)</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="https://GlobXplore.com/canada"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#374151] mb-2 uppercase tracking-widest">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] h-24 resize-none"
                placeholder="Describe the content purpose..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

