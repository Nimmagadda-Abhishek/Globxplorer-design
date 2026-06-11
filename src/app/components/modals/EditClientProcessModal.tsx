import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { visaAgentApi } from "../../../lib/api";
import { toast } from "sonner";

interface EditClientProcessModalProps {
   isOpen: boolean;
   onClose: () => void;
   client: any;
   onSuccess: () => void;
}

export function EditClientProcessModal({ isOpen, onClose, client, onSuccess }: EditClientProcessModalProps) {
   const [isUpdating, setIsUpdating] = useState(false);
   
   const [formData, setFormData] = useState({
      stage: client?.stage || "",
      country: client?.country || "",
      visaType: client?.visaType || "",
      locationPriority: client?.locationPriority || "",
      cutOffDates: client?.cutOffDates || ""
   });

   if (!isOpen) return null;

   const handleSubmit = async () => {
      try {
         setIsUpdating(true);
         await visaAgentApi.clients.update(client._id, formData);
         toast.success("Process updated successfully");
         onSuccess();
         onClose();
      } catch (error: any) {
         toast.error(error.message || "Failed to update process");
      } finally {
         setIsUpdating(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={onClose} />
         <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-black text-[#111827]">Manual Process Update</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">General Details</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
               </button>
            </div>

            <div className="p-8 space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Pipeline Stage</label>
                  <select
                     value={formData.stage}
                     onChange={e => setFormData({ ...formData, stage: e.target.value })}
                     className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none appearance-none"
                  >
                     <option value="lead">Lead</option>
                     <option value="ds160_processing">DS-160 Processing</option>
                     <option value="monitoring_slots">Monitoring Slots</option>
                     <option value="interview_scheduled">Interview Scheduled</option>
                     <option value="completed">Completed</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Country</label>
                     <input
                        type="text"
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Visa Type</label>
                     <input
                        type="text"
                        value={formData.visaType}
                        onChange={e => setFormData({ ...formData, visaType: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Location Priority</label>
                  <input
                     type="text"
                     value={formData.locationPriority}
                     onChange={e => setFormData({ ...formData, locationPriority: e.target.value })}
                     placeholder="e.g. Mumbai, Delhi"
                     className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Cut-off Dates</label>
                  <input
                     type="text"
                     value={formData.cutOffDates}
                     onChange={e => setFormData({ ...formData, cutOffDates: e.target.value })}
                     placeholder="e.g. Before Dec 2026"
                     className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none"
                  />
               </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
               <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
               >
                  Cancel
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-gray-200"
               >
                  {isUpdating ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                     <Save className="w-4 h-4" />
                  )}
                  Save Changes
               </button>
            </div>
         </div>
      </div>
   );
}
