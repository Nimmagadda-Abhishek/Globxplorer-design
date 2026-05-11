import {
   User,
   Mail,
   Phone,
   Globe,
   CreditCard,
   Calendar,
   MapPin,
   ArrowLeft,
   CheckCircle2,
   Loader2,
   FileText,
   IdCard,
   Plane,
   Clock,
   Shield,
   ExternalLink,
   ChevronRight,
   AlertCircle,
   FileCheck,
   Lock,
   CalendarCheck,
   Download,
   Plus,
   X,
   Save,
   RefreshCw,
   Copy
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { visaAgentApi } from "../../../lib/api";
import { toast } from "sonner";

export function ClientProfilePage() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState("overview");
   const [client, setClient] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [isUpdating, setIsUpdating] = useState(false);

   // DS-160 Modal State
   const [showDS160Modal, setShowDS160Modal] = useState(false);
   const [ds160Username, setDs160Username] = useState("");
   const [ds160Password, setDs160Password] = useState("");
   const [ds160ConfirmationNo, setDs160ConfirmationNo] = useState("");

   // Portal Modal State
   const [showPortalModal, setShowPortalModal] = useState(false);
   const [portalName, setPortalName] = useState("");
   const [portalUrl, setPortalUrl] = useState("");
   const [portalUsername, setPortalUsername] = useState("");
   const [portalPassword, setPortalPassword] = useState("");

   // Payment Link Modal State
   const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
   const [paymentAmount, setPaymentAmount] = useState("");
   const [paymentDesc, setPaymentDesc] = useState("");

   // Password Visibility States
   const [showPortalPassword, setShowPortalPassword] = useState(false);
   const [revealedPortalPassword, setRevealedPortalPassword] = useState("");
   const [showDS160Password, setShowDS160Password] = useState(false);
   const [revealedDS160Password, setRevealedDS160Password] = useState("");

   // Appointment Management State
   const [showAppointmentModal, setShowAppointmentModal] = useState(false);
   const [biometricDate, setBiometricDate] = useState("");
   const [interviewDate, setInterviewDate] = useState("");
   const [appointmentLocation, setAppointmentLocation] = useState("");
   const [showRescheduleModal, setShowRescheduleModal] = useState(false);
   const [rescheduleNotes, setRescheduleNotes] = useState("");
   const [isRescheduleNeeded, setIsRescheduleNeeded] = useState(false);

   useEffect(() => {
      if (id) fetchClientDetails();
   }, [id]);

   const handleSyncPaymentLink = async (plId: string) => {
      try {
         setIsUpdating(true);
         const res = await visaAgentApi.payments.syncLinkStatus(id!, plId);
         toast.success(`Payment status: ${res.data.status}`);
         fetchClientDetails();
      } catch (err) {
         console.error("Sync error:", err);
         toast.error("Failed to sync payment status");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleTogglePortalPassword = async () => {
      if (showPortalPassword) {
         setShowPortalPassword(false);
         return;
      }

      try {
         setIsUpdating(true);
         const res = await visaAgentApi.clients.getPortalCredentials(id!);
         const data = res.data || res;
         setRevealedPortalPassword(data.portalCredentials?.password || "Not Set");
         setShowPortalPassword(true);
      } catch (err) {
         toast.error("Failed to fetch password");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleToggleDS160Password = async () => {
      if (showDS160Password) {
         setShowDS160Password(false);
         return;
      }

      try {
         setIsUpdating(true);
         const res = await visaAgentApi.clients.getDS160Credentials(id!);
         const data = res.data || res;
         setRevealedDS160Password(data.ds160Credentials?.password || "Not Set");
         setShowDS160Password(true);
      } catch (err) {
         toast.error("Failed to fetch password");
      } finally {
         setIsUpdating(false);
      }
   };

   const fetchClientDetails = async () => {
      setLoading(true);
      try {
         const res = await visaAgentApi.clients.getById(id!);
         const data = res.data || res;
         setClient(data);

         // Sync DS-160 states
         setDs160Username(data.ds160Credentials?.username || "");
         setDs160ConfirmationNo(data.ds160Credentials?.confirmationNumber || "");

         // Sync Portal states
         setPortalName(data.portalCredentials?.portalName || "");
         setPortalUrl(data.portalCredentials?.portalUrl || "");
         setPortalUsername(data.portalCredentials?.username || "");

         // Sync Appointment states
         setBiometricDate(data.biometricDate ? new Date(data.biometricDate).toISOString().split('T')[0] : "");
         setInterviewDate(data.interviewDate ? new Date(data.interviewDate).toISOString().split('T')[0] : "");
         setAppointmentLocation(data.location || "");
         setIsRescheduleNeeded(data.rescheduleNeeded || false);
         setRescheduleNotes(data.notes || "");
      } catch (err) {
         console.error("Fetch client error:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleStartMonitoring = async () => {
      try {
         setIsUpdating(true);
         await visaAgentApi.appointments.setMonitoring(id!);
         toast.success("Client moved to slot monitoring");
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to start monitoring");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleBookAppointment = async () => {
      try {
         setIsUpdating(true);
         await visaAgentApi.appointments.book(id!, {
            biometricDate,
            interviewDate,
            location: appointmentLocation
         });
         toast.success("Appointment details recorded");
         setShowAppointmentModal(false);
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to record appointment");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleSetReschedule = async () => {
      try {
         setIsUpdating(true);
         await visaAgentApi.appointments.setReschedule(id!, {
            reschedule: isRescheduleNeeded,
            notes: rescheduleNotes
         });
         toast.success("Reschedule status updated");
         setShowRescheduleModal(false);
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to update reschedule status");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleConfirmSlot = async (status: 'Pending' | 'Confirmed') => {
      try {
         setIsUpdating(true);
         await visaAgentApi.appointments.confirmSlot(id!, status);
         toast.success(`Slot booking marked as ${status}`);
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to update slot status");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleFileUpload = async (type: 'ds160' | 'confirmation' | 'general', file: File) => {
      try {
         setIsUpdating(true);
         const formData = new FormData();
         formData.append('file', file);

         if (type === 'ds160') {
            await visaAgentApi.documents.uploadDS160(id!, formData);
         } else if (type === 'confirmation') {
            await visaAgentApi.appointments.uploadConfirmation(id!, formData);
         } else {
            // General doc
            formData.append('name', file.name);
            await visaAgentApi.documents.uploadDS160(id!, formData); // Reusing upload for now
         }

         toast.success("File uploaded successfully");
         fetchClientDetails();
      } catch (err) {
         toast.error("Upload failed");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleScreeningUpdate = async (type: 'biometric' | 'interview', status: 'Pending' | 'Completed') => {
      try {
         setIsUpdating(true);
         if (type === 'biometric') {
            await visaAgentApi.screening.updateBiometric(id!, status);
         } else {
            await visaAgentApi.screening.updateInterview(id!, status);
         }
         toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} screening marked as ${status}`);
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to update screening status");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleResultUpdate = async (status: 'approved' | 'not_approved') => {
      try {
         setIsUpdating(true);
         await visaAgentApi.screening.updateResult(id!, status);
         toast.success(`Result updated to ${status}`);
         fetchClientDetails();
      } catch (err) {
         toast.error("Failed to update result");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleDS160Update = async () => {
      setIsUpdating(true);
      try {
         await visaAgentApi.ds160.create(id!, {
            username: ds160Username,
            password: ds160Password,
            confirmationNumber: ds160ConfirmationNo
         });
         toast.success("DS-160 details updated successfully");
         await fetchClientDetails();
         setShowDS160Modal(false);
      } catch (err: any) {
         toast.error(err.message || "Failed to update DS-160");
      } finally {
         setIsUpdating(false);
      }
   };

   const handlePortalUpdate = async () => {
      setIsUpdating(true);
      try {
         await visaAgentApi.portal.create(id!, {
            portalName,
            portalUrl,
            username: portalUsername,
            password: portalPassword
         });
         toast.success("Portal credentials updated successfully");
         await fetchClientDetails();
         setShowPortalModal(false);
      } catch (err: any) {
         toast.error(err.message || "Failed to update Portal credentials");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleGeneratePaymentLink = async () => {
      setIsUpdating(true);
      try {
         const res = await visaAgentApi.payments.generateLink(id!, {
            amount: Number(paymentAmount),
            description: paymentDesc
         });
         const link = res.data?.short_url || res.short_url;
         toast.success("Payment link generated!");
         // Optionally open link or show to user
         window.open(link, '_blank');
         setShowPaymentLinkModal(false);
      } catch (err: any) {
         toast.error(err.message || "Failed to generate payment link");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleMarkAsDone = async () => {
      if (!confirm("Are you sure you want to mark this process as DONE?")) return;
      setIsUpdating(true);
      try {
         await visaAgentApi.markDone(id!);
         toast.success("Process marked as DONE");
         await fetchClientDetails();
      } catch (err: any) {
         toast.error(err.message || "Failed to mark as done");
      } finally {
         setIsUpdating(false);
      }
   };

   const updatePaymentStatus = async (type: 'portalFeeStatus' | 'serviceFeeStatus', status: string) => {
      setIsUpdating(true);
      try {
         const updatedPaymentTypes = {
            ...(client.paymentTypes || {}),
            [type]: status
         };
         await visaAgentApi.clients.update(id!, {
            paymentTypes: updatedPaymentTypes
         });
         toast.success(`${type === 'portalFeeStatus' ? 'Portal Fee' : 'Service Fee'} marked as ${status}`);
         await fetchClientDetails();
      } catch (err: any) {
         toast.error(err.message || "Failed to update payment status");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleLaunchPortal = () => {
      const url = client.portalCredentials?.portalUrl || 'https://www.google.com/search?q=visa+scheduling+portal+' + client.country;
      window.open(url, '_blank');
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
               <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Loading Client Profile...</p>
            </div>
         </div>
      );
   }

   if (!client) {
      return (
         <div className="min-h-screen bg-[#F8FAFC] p-8">
            <div className="bg-white p-12 rounded-[40px] border border-[#E5E7EB] text-center max-w-md mx-auto">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h2 className="text-xl font-black text-[#111827]">Client Not Found</h2>
               <p className="text-gray-500 font-medium mt-2">The client record you are looking for does not exist or has been removed.</p>
               <button onClick={() => navigate('/visa-agent/clients')} className="mt-8 px-8 py-3 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase">Go Back</button>
            </div>
         </div>
      );
   }

   // Handle name from fullName or linkedUser.name
   const clientName = client.fullName || client.linkedUser?.name || "Visa Client";

   const tabs = [
      { id: "overview", label: "Overview", icon: User },
      { id: "ds160", label: "DS-160 Form", icon: FileText },
      { id: "portal", label: "Visa Portal", icon: Globe },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "appointments", label: "Appointments", icon: CalendarCheck },
      { id: "documents", label: "Documents", icon: Shield }
   ];

   return (
      <>
         <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
               {/* Header */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111827] p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-gray-200">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-24 h-24 bg-emerald-600 rounded-[32px] flex items-center justify-center text-4xl font-black shadow-2xl shadow-black/20 border-4 border-white/10">
                        {clientName.charAt(0)}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h1 className="text-3xl font-black tracking-tight">{clientName}</h1>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${client.manualStatus === 'Done' ? 'bg-blue-500 text-white' :
                              client.approvalStatus === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                              {client.manualStatus === 'Done' ? 'COMPLETED' : (client.approvalStatus || client.stage?.replace(/_/g, ' ') || 'ACTIVE')}
                           </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                           <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
                              <IdCard className="w-4 h-4 text-emerald-500" />
                              {client.clientId || client.gxvcId || 'GXVC_PENDING'}
                           </div>
                           <div className="w-1 h-1 bg-white/20 rounded-full" />
                           <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
                              <Globe className="w-4 h-4 text-blue-500" />
                              {client.country} • {client.visaType}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                     <button
                        onClick={handleMarkAsDone}
                        disabled={client.manualStatus === 'Done'}
                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
                     >
                        {client.manualStatus === 'Done' ? 'Finished' : 'Mark as Done'}
                     </button>
                     <button className="px-6 py-3 bg-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Action
                     </button>
                  </div>
               </div>

               {/* Navigation Tabs */}
               <div className="bg-white p-2 rounded-[32px] border border-[#E5E7EB] shadow-sm flex overflow-x-auto no-scrollbar gap-1">
                  {tabs.map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                           ? 'bg-[#111827] text-white shadow-lg'
                           : 'text-[#6B7280] hover:bg-gray-50'
                           }`}
                     >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-400' : 'text-gray-400'}`} />
                        {tab.label}
                     </button>
                  ))}
               </div>

               {/* Content Area */}
               <div className="grid lg:grid-cols-4 gap-8">
                  {/* Sidebar Info */}
                  <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm space-y-8">
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Contact Details</h3>
                           <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                 <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Mail className="w-4 h-4" />
                                 </div>
                                 <div className="overflow-hidden">
                                    <p className="text-xs font-black text-[#111827] break-all">{client.linkedUser?.email || client.email || '-'}</p>
                                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase mt-0.5">Primary Email</p>
                                 </div>
                              </div>
                              <div className="flex items-start gap-3">
                                 <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <Phone className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-[#111827]">{client.linkedUser?.phone || client.contact || '-'}</p>
                                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase mt-0.5">Mobile Number</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-[#F3F4F6]">
                           <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Travel Identity</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                 <div className="flex items-center justify-between mb-2">
                                    <IdCard className="w-4 h-4 text-gray-400" />
                                    <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">Passport</span>
                                 </div>
                                 <p className="text-sm font-black text-[#111827]">{client.passport || '-'}</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                 <div className="flex items-center justify-between mb-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">National ID (Aadhar)</span>
                                 </div>
                                 <p className="text-sm font-black text-[#111827]">{client.aadhar || '-'}</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-[#F3F4F6]">
                           <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Preferences</h3>
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <Clock className="w-4 h-4 text-orange-500" />
                                 <p className="text-xs font-bold text-[#4B5563]">{client.cutOffDates || 'No cut-off set'}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <MapPin className="w-4 h-4 text-red-500" />
                                 <p className="text-xs font-bold text-[#4B5563]">{client.locationPriority || 'Any Location'}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Dynamic Content */}
                  <div className="lg:col-span-3">
                     {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                           {/* Summary Stats */}
                           <div className="grid md:grid-cols-3 gap-6">
                              <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <FileCheck className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">DS-160 Status</p>
                                    <p className="text-base font-black text-[#111827] mt-0.5">{client.ds160Status || 'Pending'}</p>
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <CreditCard className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Visa Fee Status</p>
                                    <p className="text-base font-black text-[#111827] mt-0.5">{client.visaFeePaymentStatus || 'Pending'}</p>
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Calendar className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Slot Status</p>
                                    <p className="text-base font-black text-[#111827] mt-0.5">{client.slotBookingStatus || 'Pending'}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Pipeline Progress */}
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <div className="flex items-center justify-between mb-8">
                                 <h3 className="text-sm font-black text-[#111827] uppercase tracking-[0.2em]">Application Roadmap</h3>
                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">40% Completed</span>
                              </div>
                              <div className="relative space-y-8">
                                 <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-gray-100" />
                                 {[
                                    { label: 'Client Created', date: new Date(client.createdAt).toLocaleDateString(), status: 'completed' },
                                    { label: 'DS-160 Preparation', date: client.ds160Status === 'Pending' ? 'In Progress' : 'Completed', status: client.ds160Status === 'Pending' ? 'active' : 'completed' },
                                    { label: 'Visa Fee Payment', date: client.visaFeePaymentStatus === 'Pending' ? 'Pending' : 'Completed', status: client.visaFeePaymentStatus === 'Pending' ? 'active' : 'completed' },
                                    { label: 'Slot Monitoring & Booking', date: client.slotBookingStatus === 'Pending' ? 'Pending' : 'Completed', status: 'pending' },
                                    { label: 'Visa Interview', date: client.interviewStatus || 'Pending', status: 'pending' }
                                 ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-6 relative z-10">
                                       <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.status === 'completed' ? 'bg-emerald-500' :
                                          step.status === 'active' ? 'bg-blue-500 animate-pulse' :
                                             'bg-gray-200'
                                          }`}>
                                          {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                       </div>
                                       <div className="flex-1 flex items-center justify-between">
                                          <div>
                                             <p className={`text-sm font-black ${step.status === 'pending' ? 'text-gray-400' : 'text-[#111827]'}`}>{step.label}</p>
                                             <p className="text-[10px] text-[#9CA3AF] font-bold mt-1 uppercase tracking-tighter">{step.date}</p>
                                          </div>
                                          {step.status === 'active' && (
                                             <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-1.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                                                Resume Task
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'ds160' && (
                        <div className="bg-white p-12 rounded-[40px] border border-[#E5E7EB] shadow-sm animate-in zoom-in duration-300">
                           <div className="max-w-2xl mx-auto text-center space-y-8">
                              <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto text-blue-600">
                                 <FileText className="w-12 h-12" />
                              </div>
                              <div>
                                 <h2 className="text-2xl font-black text-[#111827]">DS-160 Online Form</h2>
                                 <p className="text-gray-500 font-medium mt-2">Generate and manage the DS-160 confirmation number for this client.</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-left">
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-lg font-black text-[#111827]">{client.ds160Status || 'Pending'}</p>
                                 </div>
                                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-left">
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Confirmation No.</p>
                                    <p className="text-lg font-black text-[#111827] font-mono">{client.ds160Credentials?.confirmationNumber || 'PENDING'}</p>
                                 </div>
                                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-left">
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Username</p>
                                    <p className="text-sm font-black text-[#111827]">{client.ds160Credentials?.username || 'NOT SET'}</p>
                                 </div>
                                 <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                       <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Password</p>
                                       <button onClick={handleToggleDS160Password} className="text-[9px] font-black text-blue-600 uppercase hover:underline">
                                          {showDS160Password ? 'Hide' : 'Show'}
                                       </button>
                                    </div>
                                    <p className="text-sm font-black text-[#111827]">
                                       {showDS160Password ? revealedDS160Password : '********'}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                 <button
                                    onClick={() => setShowDS160Modal(true)}
                                    className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
                                 >
                                    Update DS-160 Status
                                    <ChevronRight className="w-4 h-4" />
                                 </button>
                                 <button className="w-full py-4 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                                    <Download className="w-4 h-4" />
                                    Upload Confirmation PDF
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'portal' && (
                        <div className="bg-white p-12 rounded-[40px] border border-[#E5E7EB] shadow-sm animate-in slide-in-from-bottom duration-300">
                           <div className="max-w-2xl mx-auto space-y-12">
                              <div className="text-center">
                                 <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto text-emerald-600 mb-6">
                                    <Globe className="w-12 h-12" />
                                 </div>
                                 <h2 className="text-2xl font-black text-[#111827]">Visa Portal Credentials</h2>
                                 <p className="text-gray-500 font-medium mt-2">Manage login details for the official visa scheduling portal.</p>
                              </div>

                              <div className="space-y-4">
                                 <div className="p-8 bg-[#F9FAFB] rounded-[32px] border border-[#E5E7EB] space-y-6">
                                    <div className="grid grid-cols-2 gap-8">
                                       <div className="col-span-2">
                                          <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Portal Name / URL</p>
                                          <p className="text-sm font-black text-[#111827]">{client.portalCredentials?.portalName || 'Not Set'} {client.portalCredentials?.portalUrl ? `(${client.portalCredentials.portalUrl})` : ''}</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Portal Email / Username</p>
                                          <div className="flex items-center gap-3">
                                             <Lock className="w-4 h-4 text-gray-400" />
                                             <p className="text-sm font-black text-[#111827]">{client.portalCredentials?.username || 'NOT SET'}</p>
                                          </div>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Portal Password</p>
                                          <div className="flex items-center gap-3">
                                             <Shield className="w-4 h-4 text-gray-400" />
                                             <p className="text-sm font-black text-[#111827]">
                                                {showPortalPassword ? revealedPortalPassword : "********"}
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                                       <button
                                          onClick={() => setShowPortalModal(true)}
                                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                       >
                                          Update Credentials
                                          <ExternalLink className="w-3 h-3" />
                                       </button>
                                       <button
                                          onClick={handleTogglePortalPassword}
                                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                       >
                                          {showPortalPassword ? "Hide Password" : "Show Password"}
                                          <ExternalLink className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>

                                 <button
                                    onClick={handleLaunchPortal}
                                    className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-3"
                                 >
                                    Launch Official Portal
                                    <ExternalLink className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'payments' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                                 <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest">Portal Fee</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${client.paymentTypes?.portalFeeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                       {client.paymentTypes?.portalFeeStatus || 'Pending'}
                                    </span>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs">
                                       <span className="text-gray-500 font-bold">Standard Fee</span>
                                       <span className="font-black text-[#111827]">₹15,000</span>
                                    </div>
                                    <button
                                       onClick={() => updatePaymentStatus('portalFeeStatus', 'Paid')}
                                       disabled={isUpdating || client.paymentTypes?.portalFeeStatus === 'Paid'}
                                       className="w-full py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#4B5563] hover:bg-gray-100 transition-all disabled:opacity-50"
                                    >
                                       {client.paymentTypes?.portalFeeStatus === 'Paid' ? 'Payment Received' : 'Mark as Paid'}
                                    </button>
                                 </div>
                              </div>
                              <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                                 <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest">Razorpay Links</h3>
                                    <CreditCard className="w-5 h-5 text-emerald-600" />
                                 </div>
                                 <div className="space-y-4">
                                    <p className="text-xs text-gray-500 font-medium">Generate a secure payment link to collect portal fees or service charges from the client.</p>
                                    <button
                                       onClick={() => setShowPaymentLinkModal(true)}
                                       className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                    >
                                       <Plus className="w-4 h-4" />
                                       Generate Payment Link
                                    </button>
                                 </div>
                              </div>
                           </div>
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6">Generated Links</h3>
                              <div className="space-y-4">
                                 {client.paymentLinks?.length > 0 ? (
                                    client.paymentLinks.map((link: any, idx: number) => (
                                       <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group">
                                          <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-[#111827]">₹{link.amount}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${link.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                      link.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                   }`}>
                                                   {link.status}
                                                </span>
                                             </div>
                                             <p className="text-[10px] text-gray-500 font-medium">{link.description}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <button
                                                onClick={() => {
                                                   navigator.clipboard.writeText(link.shortUrl);
                                                   toast.success("Link copied to clipboard");
                                                }}
                                                className="p-2 hover:bg-white rounded-xl transition-all" title="Copy Link"
                                             >
                                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                                             </button>
                                             <button
                                                onClick={() => handleSyncPaymentLink(link.plId)}
                                                className="p-2 hover:bg-white rounded-xl transition-all" title="Sync Status"
                                             >
                                                <RefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 ${isUpdating ? 'animate-spin' : ''}`} />
                                             </button>
                                          </div>
                                       </div>
                                    ))
                                 ) : (
                                    <div className="text-center py-6">
                                       <p className="text-xs text-gray-400 font-medium italic">No links generated yet.</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'appointments' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                           {/* Step 1: Slot Monitoring */}
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <div className="flex items-center justify-between mb-8">
                                 <div>
                                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-[0.2em]">Step 1: Slot Monitoring</h3>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Automated & Manual slot searching</p>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${client.stage === 'monitoring_slots' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                       {client.stage === 'monitoring_slots' ? 'Monitoring Active' : 'Waiting'}
                                    </span>
                                    <button
                                       onClick={handleStartMonitoring}
                                       disabled={isUpdating || client.stage === 'monitoring_slots'}
                                       className="px-6 py-2 bg-[#111827] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                    >
                                       Start Monitoring
                                    </button>
                                 </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Priority Location</p>
                                    <p className="text-sm font-black text-[#111827]">{client.locationPriority || 'Not Specified'}</p>
                                 </div>
                                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Target Cut-off</p>
                                    <p className="text-sm font-black text-[#111827]">{client.cutOffDates || 'No Limit'}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Step 2: Booked Details */}
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <div className="flex items-center justify-between mb-8">
                                 <div>
                                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-[0.2em]">Step 2: Appointment Booking</h3>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Finalize dates once slot is secured</p>
                                 </div>
                                 <button
                                    onClick={() => setShowAppointmentModal(true)}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                 >
                                    Record Booking
                                 </button>
                              </div>
                              <div className="grid md:grid-cols-3 gap-6">
                                 <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                                    <div className="flex items-center gap-2 mb-2">
                                       <Calendar className="w-4 h-4 text-blue-600" />
                                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Biometric Date</p>
                                    </div>
                                    <p className="text-base font-black text-[#111827]">{client.biometricDate ? new Date(client.biometricDate).toLocaleDateString() : 'TBA'}</p>
                                 </div>
                                 <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                                    <div className="flex items-center gap-2 mb-2">
                                       <CalendarCheck className="w-4 h-4 text-indigo-600" />
                                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Interview Date</p>
                                    </div>
                                    <p className="text-base font-black text-[#111827]">{client.interviewDate ? new Date(client.interviewDate).toLocaleDateString() : 'TBA'}</p>
                                 </div>
                                 <div className="p-6 bg-purple-50/30 rounded-3xl border border-purple-100/50">
                                    <div className="flex items-center gap-2 mb-2">
                                       <MapPin className="w-4 h-4 text-purple-600" />
                                       <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Location</p>
                                    </div>
                                    <p className="text-base font-black text-[#111827]">{client.appointmentLocation || 'TBA'}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Step 3: Screening Progress */}
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <h3 className="text-sm font-black text-[#111827] uppercase tracking-[0.2em] mb-8">Step 3: Screening & Results</h3>
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${client.biometricStatus === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400'}`}>
                                          <Shield className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-[#111827]">Biometric Screening</p>
                                          <p className="text-[10px] text-gray-500 font-bold uppercase">Status: {client.biometricStatus || 'Pending'}</p>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => handleScreeningUpdate('biometric', client.biometricStatus === 'Completed' ? 'Pending' : 'Completed')}
                                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${client.biometricStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                       {client.biometricStatus === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                                    </button>
                                 </div>

                                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${client.interviewStatus === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400'}`}>
                                          <Plane className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-[#111827]">Interview Screening</p>
                                          <p className="text-[10px] text-gray-500 font-bold uppercase">Status: {client.interviewStatus || 'Pending'}</p>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => handleScreeningUpdate('interview', client.interviewStatus === 'Completed' ? 'Pending' : 'Completed')}
                                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${client.interviewStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                       {client.interviewStatus === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                                    </button>
                                 </div>

                                 <div className="flex items-center justify-between p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                          <FileCheck className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-[#111827]">Final Visa Outcome</p>
                                          <p className="text-[10px] text-indigo-600 font-bold uppercase">Decision: {client.approvalStatus || 'Awaiting Result'}</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button
                                          onClick={() => handleResultUpdate('approved')}
                                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10"
                                       >
                                          Approve
                                       </button>
                                       <button
                                          onClick={() => handleResultUpdate('not_approved')}
                                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
                                       >
                                          Reject
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'documents' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                           {/* Quick Action Uploads */}
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    <FileText className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-2">DS-160 PDF</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">Upload the official confirmation document</p>
                                 <label className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all group">
                                    <input
                                       type="file"
                                       className="hidden"
                                       onChange={(e) => e.target.files?.[0] && handleFileUpload('ds160', e.target.files[0])}
                                       accept=".pdf,.jpg,.png"
                                    />
                                    <Download className="w-5 h-5 text-gray-400 mb-2 group-hover:text-blue-500" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600">Select File</span>
                                 </label>
                              </div>
                              <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                                    <CalendarCheck className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-2">Appointment Confirmation</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">Upload the booked slot confirmation page</p>
                                 <label className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all group">
                                    <input
                                       type="file"
                                       className="hidden"
                                       onChange={(e) => e.target.files?.[0] && handleFileUpload('confirmation', e.target.files[0])}
                                       accept=".pdf,.jpg,.png"
                                    />
                                    <Download className="w-5 h-5 text-gray-400 mb-2 group-hover:text-emerald-500" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600">Select File</span>
                                 </label>
                              </div>
                           </div>

                           {/* Document Repository */}
                           <div className="bg-white p-8 rounded-[40px] border border-[#E5E7EB] shadow-sm">
                              <div className="flex items-center justify-between mb-8">
                                 <h3 className="text-sm font-black text-[#111827] uppercase tracking-[0.2em]">Document Repository</h3>
                                 <label className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer">
                                    <input
                                       type="file"
                                       className="hidden"
                                       onChange={(e) => e.target.files?.[0] && handleFileUpload('general', e.target.files[0])}
                                    />
                                    <Plus className="w-3 h-3" />
                                    Upload New
                                 </label>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                 {[...(client.mandatoryDocs || []), ...(client.slotConfirmationDocs || [])].length > 0 ? (
                                    [...(client.mandatoryDocs || []), ...(client.slotConfirmationDocs || [])].map((doc: any, i: number) => (
                                       <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                             </div>
                                             <div>
                                                <p className="text-xs font-black text-[#111827]">{doc.name}</p>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</p>
                                             </div>
                                          </div>
                                          <a
                                             href={doc.url}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                                          >
                                             <ExternalLink className="w-4 h-4" />
                                          </a>
                                       </div>
                                    ))
                                 ) : (
                                    <div className="col-span-2 text-center py-12">
                                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <FileText className="w-8 h-8 text-gray-300" />
                                       </div>
                                       <p className="text-xs text-gray-400 font-black uppercase tracking-widest">No documents found</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* DS-160 Update Modal */}
            {showDS160Modal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={() => setShowDS160Modal(false)} />
                  <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-[#111827]">Update DS-160</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Client: {clientName}</p>
                        </div>
                        <button onClick={() => setShowDS160Modal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                           <X className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>
                     <div className="p-8 space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">DS-160 Confirmation Number</label>
                           <input type="text" value={ds160ConfirmationNo} onChange={e => setDs160ConfirmationNo(e.target.value)} placeholder="AA00..." className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Portal Username</label>
                              <input type="text" value={ds160Username} onChange={e => setDs160Username(e.target.value)} placeholder="Username" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Portal Password</label>
                              <input type="password" value={ds160Password} onChange={e => setDs160Password(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 flex gap-4">
                        <button
                           onClick={() => setShowDS160Modal(false)}
                           className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDS160Update}
                           disabled={isUpdating}
                           className="flex-1 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-gray-200"
                        >
                           {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                              <Save className="w-4 h-4" />
                           )}
                           Save DS-160
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Portal Update Modal */}
            {showPortalModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={() => setShowPortalModal(false)} />
                  <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-[#111827]">Portal Credentials</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Visa Scheduling System</p>
                        </div>
                        <button onClick={() => setShowPortalModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                           <X className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>

                     <div className="p-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Portal Name</label>
                              <input type="text" value={portalName} onChange={e => setPortalName(e.target.value)} placeholder="e.g. US AIS" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Portal URL</label>
                              <input type="text" value={portalUrl} onChange={e => setPortalUrl(e.target.value)} placeholder="https://..." className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Email / Username</label>
                           <input type="text" value={portalUsername} onChange={e => setPortalUsername(e.target.value)} placeholder="portal-email@example.com" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Password</label>
                           <input type="password" value={portalPassword} onChange={e => setPortalPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 flex gap-4">
                        <button onClick={() => setShowPortalModal(false)} className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                        <button onClick={handlePortalUpdate} disabled={isUpdating} className="flex-1 py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                           Save Portal
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Payment Link Modal */}
            {showPaymentLinkModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={() => setShowPaymentLinkModal(false)} />
                  <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-[#111827]">Generate Payment Link</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Razorpay Integration</p>
                        </div>
                        <button onClick={() => setShowPaymentLinkModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                           <X className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>

                     <div className="p-8 space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Amount (INR)</label>
                           <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="15000" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Description</label>
                           <input type="text" value={paymentDesc} onChange={e => setPaymentDesc(e.target.value)} placeholder="Visa Portal Fee / Service Charge" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 flex gap-4">
                        <button onClick={() => setShowPaymentLinkModal(false)} className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                        <button onClick={handleGeneratePaymentLink} disabled={isUpdating} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                           Generate & Open
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Appointment Recording Modal */}
            {showAppointmentModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={() => setShowAppointmentModal(false)} />
                  <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-[#111827]">Record Appointment</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Confirmed Slot Details</p>
                        </div>
                        <button onClick={() => setShowAppointmentModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                           <X className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>

                     <div className="p-8 space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Biometric Appointment Date</label>
                           <input type="date" value={biometricDate} onChange={e => setBiometricDate(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Consular Interview Date</label>
                           <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">VAC / Consulate Location</label>
                           <input type="text" value={appointmentLocation} onChange={e => setAppointmentLocation(e.target.value)} placeholder="e.g. Hyderabad / Chennai" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none" />
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 flex gap-4">
                        <button onClick={() => setShowAppointmentModal(false)} className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                        <button onClick={handleBookAppointment} disabled={isUpdating} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                           Save Booking
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={() => setShowRescheduleModal(false)} />
                  <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-[#111827]">Request Reschedule</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Flag for Slot Monitoring</p>
                        </div>
                        <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                           <X className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>

                     <div className="p-8 space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                           <input
                              type="checkbox"
                              id="resched"
                              checked={isRescheduleNeeded}
                              onChange={e => setIsRescheduleNeeded(e.target.checked)}
                              className="w-5 h-5 rounded-lg border-orange-300 text-orange-600 focus:ring-orange-500"
                           />
                           <label htmlFor="resched" className="text-xs font-black text-orange-700 uppercase tracking-widest cursor-pointer">Mark as Needs Reschedule</label>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Internal Notes / Reason</label>
                           <textarea value={rescheduleNotes} onChange={e => setRescheduleNotes(e.target.value)} rows={4} placeholder="Reason for reschedule..." className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none resize-none" />
                        </div>
                     </div>

                     <div className="p-8 bg-gray-50 flex gap-4">
                        <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-4 bg-white border border-gray-200 text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                        <button onClick={handleSetReschedule} disabled={isUpdating} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                           Update Status
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </>
   );
}
