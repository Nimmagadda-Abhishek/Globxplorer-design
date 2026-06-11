import React, { useState, useEffect } from "react";
import { PhoneCall, CheckCircle2, UserPlus, X } from "lucide-react";
import { leadApi } from "../../../lib/api";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead: any;
}

export function EditLeadModal({ isOpen, onClose, onSuccess, lead }: EditLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    notes: "",
    followUpDate: "",
    country: "",
    course: "",
    intake: ""
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        status: lead.status || "Contacted",
        notes: lead.notes || "",
        followUpDate: lead.followUpDate || "",
        country: lead.country || lead.interestCountry || "",
        course: lead.course || "",
        intake: lead.intake || ""
      });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await leadApi.updateLeadStatus(lead.id || lead._id, formData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E7EB]">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#111827]">Edit Lead: {lead.name}</h2>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Phone</label>
              <input 
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Update Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Call not answered">Call not answered</option>
                <option value="Interested">Interested</option>
                <option value="Not interested">Not interested</option>
                <option value="Follow-up scheduled">Follow-up scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Next Follow-up</label>
              <input 
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2 text-left">Call Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input 
                placeholder="Course (e.g. MBA)"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input 
                placeholder="Intake (e.g. 2026)"
                value={formData.intake}
                onChange={(e) => setFormData({...formData, intake: e.target.value})}
                className="w-full px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338CA] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Updating..." : "Save Details"}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
