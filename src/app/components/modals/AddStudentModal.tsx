import { X, Loader2, CheckCircle2, GraduationCap, UserCheck, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { amApi, adminApi, counsellorApi } from "../../../lib/api";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ gxId: string; password?: string; message: string } | null>(null);
  const [agents, setAgents] = useState<any[]>([]);

  const role = localStorage.getItem("userRole") || "ADMIN";
  const isAM = role === "AGENT_MANAGER";
  const isCounsellor = role === "COUNSELLOR";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    alternateContact: "",
    country: "",
    interestedUniversity: "",
    interestedLocation: "",
    interestedProgram: "",
    educationBackground: "",
    percentage: "",
    passingYear: "",
    loanStatus: "Required",
    universityType: "Public",
    intake: "",
    budgetRange: "",
    assignedAgentGxId: "",
  });

  useEffect(() => {
    if (isOpen && isAM) {
      fetchMyAgents();
    }
  }, [isOpen, isAM]);

  const fetchMyAgents = async () => {
    try {
      const res: any = await amApi.agents.list();
      setAgents(res.data?.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccessData(null);
    setFormData({
      fullName: "",
      email: "",
      contact: "",
      alternateContact: "",
      country: "",
      interestedUniversity: "",
      interestedLocation: "",
      interestedProgram: "",
      educationBackground: "",
      percentage: "",
      passingYear: "",
      loanStatus: "Required",
      universityType: "Public",
      intake: "",
      budgetRange: "",
      assignedAgentGxId: "",
    });
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res: any;
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.contact,
        alternateContact: formData.alternateContact,
        interestedCountry: formData.country,
        interestedUniversity: formData.interestedUniversity,
        interestedLocation: formData.interestedLocation,
        interestedProgram: formData.interestedProgram,
        educationBackground: formData.educationBackground,
        percentage: formData.percentage,
        passingYear: formData.passingYear,
        loanStatus: formData.loanStatus,
        universityType: formData.universityType,
        intake: formData.intake,
        budgetRange: formData.budgetRange,
      };

      if (isCounsellor) {
        res = await counsellorApi.createStudent(payload);
      } else {
        res = await amApi.students.create({ ...payload, assignedAgentGxId: formData.assignedAgentGxId });
      }
      
      setSuccessData({
        gxId: res.data?.credentials?.gxId || res.data?.student?.gxId || res.data?.gxId || "GXST" + Math.floor(Math.random() * 1000000),
        password: res.data?.credentials?.password,
        message: "Student record created and assigned successfully."
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create student record.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#4F46E5]" />
            </div>
            <h2 className="text-2xl font-black text-[#111827] mb-2">Student Enrolled!</h2>
            <p className="text-sm text-[#6B7280] mb-8 font-medium">The student has been assigned a unique GX ID and recorded in your pipeline.</p>
            
            <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-6 text-left mb-8 space-y-4">
              <div>
                 <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">Generated Student ID</span>
                 <span className="text-2xl font-black text-[#111827] tracking-tight">{successData.gxId}</span>
              </div>
              {successData.password && (
                <div>
                   <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">Temporary Password</span>
                   <span className="text-2xl font-black text-[#111827] tracking-tight">{successData.password}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full px-6 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
            >
              Close & Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E5E7EB]">
        <div className="bg-white border-b border-[#F3F4F6] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
               <GraduationCap className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#111827] tracking-tight">Create Student Record</h2>
              <p className="text-xs text-[#6B7280] font-medium">Add student to pipeline and link to agent</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., Amit Sharma"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Contact Number *</label>
              <input
                type="tel"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="9999999999"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="amit@mail.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Alternate Contact</label>
              <input
                type="tel"
                value={formData.alternateContact}
                onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Preferred Country *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
              >
                <option value="">Select Target Country</option>
                <option value="UK">United Kingdom</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Ireland">Ireland</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Interested University</label>
              <input
                type="text"
                value={formData.interestedUniversity}
                onChange={(e) => setFormData({ ...formData, interestedUniversity: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., University of Oxford"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Interested Location</label>
              <input
                type="text"
                value={formData.interestedLocation}
                onChange={(e) => setFormData({ ...formData, interestedLocation: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., Oxford"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Interested Program</label>
              <input
                type="text"
                value={formData.interestedProgram}
                onChange={(e) => setFormData({ ...formData, interestedProgram: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., MS in CS"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Education Background</label>
              <input
                type="text"
                value={formData.educationBackground}
                onChange={(e) => setFormData({ ...formData, educationBackground: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., B.Tech in IT"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Percentage</label>
              <input
                type="text"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., 85%"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Passing Year</label>
              <input
                type="text"
                value={formData.passingYear}
                onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Intake</label>
              <input
                type="text"
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., Fall 2025"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Budget Range</label>
              <input
                type="text"
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                placeholder="e.g., ₹20L - ₹30L"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">Loan Status</label>
              <select
                value={formData.loanStatus}
                onChange={(e) => setFormData({ ...formData, loanStatus: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
              >
                <option value="Required">Required</option>
                <option value="Not Required">Not Required</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2">University Type</label>
              <select
                value={formData.universityType}
                onChange={(e) => setFormData({ ...formData, universityType: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>

          {!isCounsellor && (
            <div>
              <label className="block text-[10px] font-black text-[#374151] uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5" />
                Assign to Agent (Optional)
              </label>
              <select
                value={formData.assignedAgentGxId}
                onChange={(e) => setFormData({ ...formData, assignedAgentGxId: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
              >
                <option value="">Select one of your agents</option>
                {agents.map(agent => (
                  <option key={agent.gxId} value={agent.gxId}>
                    {agent.businessName} ({agent.gxId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center items-center px-6 py-4 bg-[#4F46E5] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4338CA] transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}