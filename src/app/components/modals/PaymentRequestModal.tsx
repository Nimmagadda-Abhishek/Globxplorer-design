import { useState } from "react";
import { X, CreditCard, Loader2, Search, Calendar, DollarSign, FileText, Plus } from "lucide-react";
import { paymentApi, adminApi } from "../../../lib/api";
import { toast } from "sonner";

interface PaymentRequestModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentRequestModal({ onClose, onSuccess }: PaymentRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    dueDate: ""
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      console.log("Searching for student:", searchQuery);
      const res: any = await adminApi.students.list({ search: searchQuery, q: searchQuery });
      console.log("Search response:", res);
      
      // Robust data extraction handling both flat and pipeline-grouped formats
      const rawData = res.data?.students || res.students || res.data || [];
      let studentsList: any[] = [];
      
      if (Array.isArray(rawData)) {
        if (rawData.length > 0 && rawData[0].students) {
          // It's grouped by stage (pipeline format)
          studentsList = rawData.flatMap((group: any) => group.students || []);
        } else {
          // It's already a flat list
          studentsList = rawData;
        }
      }
      
      setSearchResults(studentsList);
      if (studentsList.length === 0) {
        toast.error("No students found matching your search");
      }
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Failed to search students");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        studentId: selectedStudent._id || selectedStudent.id,
        gxId: selectedStudent.gxId || selectedStudent.userId?.gxId || "N/A",
        title: formData.title,
        amount: Number(formData.amount),
        description: formData.description,
        dueDate: formData.dueDate || undefined
      };
      console.log("Submitting payment request:", payload);
      await paymentApi.createRequest(payload);
      toast.success("Payment request created successfully");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Request Payment</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Generate new invoice for student</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Student Search Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
              Select Student
            </label>
            {!selectedStudent ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                    placeholder="Search by Name or GXID..."
                    className="w-full pl-11 pr-24 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-white">
                    {searchResults.map((s) => (
                      <button
                        key={s._id || s.id}
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{s.name}</p>
                          <p className="text-[10px] font-black text-indigo-600">{s.gxId}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-indigo-900">{selectedStudent.name}</p>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedStudent.gxId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                Request Title
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Visa Fee, Subscription"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                Amount (INR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
              Due Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about this payment..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#111827] text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
