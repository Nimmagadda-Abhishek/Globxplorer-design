import { X, Upload, Loader2, CheckCircle2, ShieldCheck, AlertCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { userApi, amApi } from "../../../lib/api";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAgentModal({ isOpen, onClose, onSuccess }: AddAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [successData, setSuccessData] = useState<{ gxId: string; autoPassword?: string; message?: string } | null>(null);
  
  const role = localStorage.getItem("userRole") || "ADMIN";
  const isAM = role === "AGENT_MANAGER";
  
  const [managers, setManagers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessOwnerName: "",
    email: "",
    whatsapp: "",
    secondaryNumber: "",
    locationUrl: "",
    businessArea: "",
    street: "",
    lineNumber: "",
    natureOfBusiness: "",
    mouStatus: "pending",
    bankName: "",
    accountNo: "",
    assignedManagerId: "",
    status: "Interested",
  });
  const [businessBoardPhoto, setBusinessBoardPhoto] = useState<File | null>(null);
  const [verificationPhoto, setVerificationPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && !successData && !isAM) {
      userApi.getAgentManagers()
        .then((res: any) => {
          const m = Array.isArray(res) ? res : res.data || [];
          setManagers(m);
        })
        .catch(err => console.error("Could not load managers", err));
    }
  }, [isOpen, successData, isAM]);

  const checkDuplicate = async (name: string) => {
    if (name.length < 3) return;
    try {
      const res: any = await amApi.agents.search(name);
      if (res.exists && res.data && res.data.length > 0) {
        setDuplicateWarning(res.data[0]);
      } else if (res.exists) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.error("Duplicate check failed", err);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccessData(null);
    setFormData({
      businessName: "", businessOwnerName: "", email: "", whatsapp: "", secondaryNumber: "",
      locationUrl: "", businessArea: "", street: "", lineNumber: "", natureOfBusiness: "",
      mouStatus: "pending", bankName: "", accountNo: "", assignedManagerId: "", status: "Interested"
    });
    setBusinessBoardPhoto(null);
    setVerificationPhoto(null);
    setError("");
    setDuplicateWarning(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'business' | 'verification') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'business') setBusinessBoardPhoto(e.target.files[0]);
      if (type === 'verification') setVerificationPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let payload: any;
      if (isAM && formData.status !== 'Revisit' && !businessBoardPhoto) {
        payload = {
          ...formData,
          accountDetails: {
            bankName: formData.bankName,
            accountNo: formData.accountNo
          }
        };
      } else {
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) payload.append(key, value as string);
        });
        if (isAM) {
          payload.append("accountDetails", JSON.stringify({
            bankName: formData.bankName,
            accountNo: formData.accountNo
          }));
        }
        if (businessBoardPhoto) {
          payload.append("businessBoardPhoto", businessBoardPhoto);
        }
        if (verificationPhoto) {
          payload.append("verificationPhoto", verificationPhoto);
        }
      }

      const res: any = isAM ? await amApi.agents.create(payload) : await userApi.createAgent(payload as FormData);
      const data = res.data || res;
      const user = data.agent || data.user || data;
      
      if (formData.status === 'Interested' || !isAM) {
        setSuccessData({
          gxId: user.gxId || "N/A",
          autoPassword: data.password || user.password || data.autoPassword || user.autoPassword || res.autoPassword || "Check email/whatsapp",
          message: res.message || "Agent created successfully"
        });
      } else {
        alert(`Agent saved with status: ${formData.status}`);
        handleClose();
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create Agent.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-[#111827] mb-2 tracking-tight">Agent Inducted!</h2>
            <p className="text-sm text-[#6B7280] mb-8 font-medium">
              The credentials have been generated and sent to the agent via WhatsApp.
            </p>
            
            <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5 mb-8 text-left space-y-4">
              <div>
                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">GX ID (Username)</span>
                <span className="text-xl font-black text-[#4F46E5] tracking-tight">{successData.gxId}</span>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB]">
                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest block mb-1">Temporary Password</span>
                <span className="text-xl font-black text-[#111827] select-all">{successData.autoPassword}</span>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full px-6 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#E5E7EB]">
        <div className="bg-white border-b border-[#F3F4F6] p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
               <ShieldCheck className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#111827] tracking-tight">
                New Agent Enrollment
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">Register business login and field-visit data</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 flex-1 custom-scrollbar">
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="mb-8 p-5 rounded-2xl bg-orange-50 border border-orange-100 flex gap-4 animate-in slide-in-from-top-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-orange-900 uppercase tracking-wide">Already Visited Before!</p>
                <p className="text-xs text-orange-700 font-bold mt-1">
                  {typeof duplicateWarning.businessName === 'string' ? duplicateWarning.businessName : 'Agent'} (ID: {typeof duplicateWarning.gxId === 'string' ? duplicateWarning.gxId : 'Unknown'}) already exists at {typeof duplicateWarning.location === 'object' ? JSON.stringify(duplicateWarning.location) : duplicateWarning.location || 'this location'}.
                </p>
                <button className="mt-3 text-[10px] font-black text-orange-900 underline uppercase tracking-widest">View History</button>
              </div>
            </div>
          )}

          <form id="agent-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Step 1: Business Details */}
            <section>
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
                 Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Business Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.businessName} 
                    onChange={(e) => {
                      setFormData({ ...formData, businessName: e.target.value });
                      checkDuplicate(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                    placeholder="e.g., ABC Overseas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Business Owner Name *</label>
                  <input type="text" required value={formData.businessOwnerName} onChange={(e) => setFormData({ ...formData, businessOwnerName: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Official Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">WhatsApp Number *</label>
                  <input type="tel" required value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"/>
                </div>
                {isAM && (
                  <div>
                    <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Interest Status *</label>
                    <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all">
                      <option value="Interested">Interested (Provision user)</option>
                      <option value="Not Interested">Not Interested (Save lead)</option>
                      <option value="Revisit">Re-visit (Upload photo)</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

            {/* Step 2: Location Details */}
            <section>
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
                 Field Visit Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Maps Location URL *</label>
                  <input type="url" required value={formData.locationUrl} onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" placeholder="Paste Google Maps Link" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Nature Of Business *</label>
                  <select required value={formData.natureOfBusiness} onChange={(e) => setFormData({ ...formData, natureOfBusiness: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all">
                    <option value="">Select Category</option>
                    <option value="Travel Agency">Travel Agency</option>
                    <option value="Study Abroad Consultant">Study Abroad Consultant</option>
                    <option value="Training Center">Training Center</option>
                    <option value="IELTS Coaching">IELTS Coaching</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Business Area *</label>
                  <input type="text" required value={formData.businessArea} onChange={(e) => setFormData({ ...formData, businessArea: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Street *</label>
                    <input type="text" required value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Line Number</label>
                    <input type="text" value={formData.lineNumber} onChange={(e) => setFormData({ ...formData, lineNumber: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-xs font-black text-[#374151] uppercase tracking-wider mb-4">
                  Photo Uploads
                </h4>
                <div className={`grid grid-cols-1 ${(!isAM || formData.status === 'Revisit') ? 'md:grid-cols-2' : ''} gap-4`}>
                  {/* Business Board Photo (Always Visible, Not Required) */}
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 text-center hover:bg-indigo-50/30 hover:border-[#4F46E5] transition-all relative group bg-white">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'business')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-[#9CA3AF] group-hover:text-[#4F46E5] mb-2 transition-colors" />
                      {businessBoardPhoto ? (
                        <span className="text-sm font-black text-emerald-600 block truncate max-w-[150px]">{businessBoardPhoto.name}</span>
                      ) : (
                        <>
                          <span className="text-sm font-black text-[#111827]">Business Board</span>
                          <span className="text-[9px] text-[#6B7280] mt-1 font-bold uppercase tracking-widest">Board or Shop Front</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Verification Photo (Only for Revisit, Required) */}
                  {(!isAM || formData.status === 'Revisit') && (
                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 text-center hover:bg-indigo-50/30 hover:border-[#4F46E5] transition-all relative group bg-white animate-in fade-in zoom-in duration-300">
                      <input type="file" required={formData.status === 'Revisit'} accept="image/*" onChange={(e) => handleFileChange(e, 'verification')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-[#9CA3AF] group-hover:text-[#4F46E5] mb-2 transition-colors" />
                        {verificationPhoto ? (
                          <span className="text-sm font-black text-emerald-600 block truncate max-w-[150px]">{verificationPhoto.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-black text-[#111827]">Location Verification <span className="text-red-500">*</span></span>
                            <span className="text-[9px] text-[#6B7280] mt-1 font-bold uppercase tracking-widest">Must include timestamp</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 3: Commercials */}
            <section>
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
                 Commercials & Payout
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">MOU Status *</label>
                  <select required value={formData.mouStatus} onChange={(e) => setFormData({ ...formData, mouStatus: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed / Signed</option>
                    <option value="not_applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Bank Name</label>
                    <input type="text" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Account Number</label>
                    <input type="text" value={formData.accountNo} onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {!isAM && (
                <div className="mt-6">
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wider mb-2">Assigned Agent Manager</label>
                  <select
                    value={formData.assignedManagerId}
                    onChange={(e) => setFormData({ ...formData, assignedManagerId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  >
                    <option value="">None (Direct Admin Control)</option>
                    {managers.map(m => (
                      <option key={m.gxId} value={m.gxId}>{m.name} ({m.gxId})</option>
                    ))}
                  </select>
                </div>
              )}
            </section>
          </form>
        </div>

        <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] p-6 flex gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-xs font-black uppercase tracking-widest text-[#6B7280] hover:bg-gray-50 transition-all"
          >
            Cancel Inductions
          </button>
          <button
            form="agent-form"
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center px-6 py-4 bg-[#4F46E5] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#4338CA] transition-all disabled:opacity-70 shadow-lg shadow-indigo-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalize & Provision"}
          </button>
        </div>
      </div>
    </div>
  );
}