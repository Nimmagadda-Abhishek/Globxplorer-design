import { X, Loader2, CreditCard, DollarSign, User, Calendar } from "lucide-react";
import { useState } from "react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordPaymentModal({ isOpen, onClose, onSuccess }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  if (!isOpen) return null;

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
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        <div className="bg-white border-b border-[#E5E7EB] p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#4F46E5]" />
              Record Payment
            </h2>
            <p className="text-[#6B7280] text-xs mt-1">Manually record a student payment in the system</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">Student GX ID *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="GX12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">Amount ($) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                placeholder="500.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option>Bank Transfer</option>
                <option>Razorpay</option>
                <option>Cash</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">Description / Notes</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] h-24 resize-none"
              placeholder="Add any additional details..."
            />
          </div>

          <div className="bg-[#F8FAFC] -mx-6 -mb-6 p-4 sm:p-6 flex gap-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E5E7EB] bg-white rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-70 shadow-md shadow-indigo-100"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Record Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
