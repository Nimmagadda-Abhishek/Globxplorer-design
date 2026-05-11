import {
   Users,
   MessageSquare,
   GraduationCap,
   MapPin,
   Briefcase,
   Search,
   Star,
   CheckCircle2,
   Calendar,
   ChevronRight,
   Home,
   Loader2,
   DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";
import { studentPortalApi } from "../../../lib/api";
import { AlumniChatModal } from "../../components/alumni/AlumniChatModal";

interface ChatTarget {
   serviceId: string;
   serviceName: string;
   otherUserId: string;
   otherUserName: string;
}

export function StudentAlumniPage() {
   const [loading, setLoading] = useState(true);
   const [services, setServices] = useState<any[]>([]);
   const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

   const currentUserId = (() => {
      try {
         const token = localStorage.getItem('token');
         if (!token) return '';
         const payload = JSON.parse(atob(token.split('.')[1]));
         return payload.id || payload._id || '';
      } catch { return ''; }
   })();

   useEffect(() => {
      const fetchServices = async () => {
         try {
            setLoading(true);
            const res = await studentPortalApi.alumni.getServices().catch(() => null);
            if (res?.success && res.data) {
               setServices(res.data);
            }
         } catch (err) {
            console.error("Failed to fetch alumni services", err);
         } finally {
            setLoading(false);
         }
      };
      fetchServices();
   }, []);

   const loadRazorpay = () => {
      return new Promise((resolve) => {
         const script = document.createElement('script');
         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
         script.onload = () => resolve(true);
         script.onerror = () => resolve(false);
         document.body.appendChild(script);
      });
   };

   const handleBook = async (service: any) => {
      try {
         // 1. Create booking record
         const bookingRes = await studentPortalApi.alumni.book(service._id);
         if (!bookingRes.success) throw new Error(bookingRes.message);

         const bookingId = bookingRes.data._id;

         // 2. Load Razorpay
         const isLoaded = await loadRazorpay();
         if (!isLoaded) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
         }

         // 3. Initiate payment order on backend
         const paymentOrder = await studentPortalApi.alumni.initiatePayment(bookingId);
         if (!paymentOrder.success) throw new Error(paymentOrder.message);

         const { order } = paymentOrder;

         // 4. Open Razorpay Modal
         const options = {
            key: "rzp_live_SdqWyTY0C7UH7A", // Match backend key to avoid 401 mismatch
            amount: order.amount,
            currency: order.currency,
            name: "GlobXplorer",
            description: `Payment for ${service.serviceType}`,
            order_id: order.id,
            handler: async (response: any) => {
               try {
                  // 5. Verify payment on backend
                  const verifyRes = await studentPortalApi.alumni.verifyPayment({
                     razorpayOrderId: response.razorpay_order_id,
                     razorpayPaymentId: response.razorpay_payment_id,
                     razorpaySignature: response.razorpay_signature,
                     bookingId
                  });

                  if (verifyRes.success) {
                     alert("Payment successful! You can now track your service in My Bookings.");
                     window.location.href = "/student/my-bookings";
                  } else {
                     alert("Payment verification failed. Please contact support.");
                  }
               } catch (err) {
                  console.error("Verification error:", err);
                  alert("Verification failed.");
               }
            },
            prefill: {
               name: "", // Will be filled by Razorpay from user info if available
               email: "",
               contact: ""
            },
            theme: {
               color: "#4f46e5"
            }
         };

         const rzp = new (window as any).Razorpay(options);
         rzp.open();

      } catch (err: any) {
         alert(err.message || "Failed to initiate booking");
      }
   };

   const openChat = (service: any) => {
      setChatTarget({
         serviceId: service._id,
         serviceName: service.serviceType,
         otherUserId: service.alumniId?._id || service.alumniId,
         otherUserName: service.alumniId?.name || 'Alumni',
      });
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Connect</h1>
               <p className="text-slate-500 mt-1 font-medium">Get real advice from students who've already been there.</p>
            </div>
            <div className="flex-1 max-w-md relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                  type="text"
                  placeholder="Search by University, Course or Expertise..."
                  className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm"
               />
            </div>
         </div>

         {/* Featured Use Cases */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { title: "University Experience", desc: "Know the real campus life and faculty quality.", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
               { title: "Accommodation Advice", desc: "Find the best places to stay within your budget.", icon: Home, color: "text-amber-600", bg: "bg-amber-50" },
               { title: "Job Market Info", desc: "Learn about part-time jobs and post-grad careers.", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" }
            ].map((item, i) => (
               <div key={i} className="p-6 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.bg} ${item.color}`}>
                     <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
               </div>
            ))}
         </div>

         <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
               </div>
               <div>
                  <p className="text-sm font-black text-amber-900">Safety Notice</p>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">Payments made to individuals outside this platform are not recommended and we are not responsible for any such transactions. Always use the "Book Now" button for secure payments.</p>
               </div>
            </div>

            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-slate-900">Alumni Services</h2>
               <button className="text-sm font-bold text-indigo-600 hover:underline">View All Services</button>
            </div>

            {loading ? (
               <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
               </div>
            ) : services.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {services.map((service, idx) => (
                     <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:border-indigo-200 transition-all group overflow-hidden relative">
                        <div className="flex items-start gap-6 relative z-10">
                           <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                              {service.alumniId?.name?.charAt(0) || "A"}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-xl font-black text-slate-900">{service.alumniId?.name || "N/A"}</h3>
                                 <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="text-[10px] font-black">₹{service.price}</span>
                                 </div>
                              </div>
                              <p className="text-sm font-bold text-indigo-600 mt-1">{service.serviceType}</p>

                              <p className="text-xs font-medium text-slate-500 mt-3 leading-relaxed">
                                 {service.description}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                 <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {service.alumniId?.gxId}
                                 </span>
                                 <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Verified Alumni
                                 </span>
                              </div>

                              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between gap-3">
                                 <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                       <Users className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase">Contact</p>
                                       <p className="text-xs font-black text-slate-700 truncate max-w-[120px]">{service.alumniId?.email}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                       onClick={() => openChat(service)}
                                       className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all flex items-center gap-2"
                                    >
                                       <MessageSquare className="w-3.5 h-3.5" />
                                       Chat
                                    </button>
                                    <button
                                       onClick={() => handleBook(service)}
                                       className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition-all flex items-center gap-2"
                                    >
                                       Book Now <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-50 transition-colors"></div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No alumni services found at the moment. Check back later!</p>
               </div>
            )}
         </div>

         <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10 max-w-lg">
               <h2 className="text-2xl font-black mb-2">Want to become a Mentor?</h2>
               <p className="text-indigo-100 font-medium">Once you graduate, you can join our Alumni network to guide future students and build your own network.</p>
            </div>
            <button className="relative z-10 px-8 py-4 bg-white text-indigo-600 rounded-[2rem] font-black text-sm hover:bg-indigo-50 transition-colors shadow-xl">
               Join Alumni Network
            </button>
            <div className="absolute left-[-5%] top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
         </div>

         {/* Real-time Chat Modal */}
         {chatTarget && (
            <AlumniChatModal
               serviceId={chatTarget.serviceId}
               serviceName={chatTarget.serviceName}
               otherUserId={chatTarget.otherUserId}
               otherUserName={chatTarget.otherUserName}
               currentUserId={currentUserId}
               onClose={() => setChatTarget(null)}
            />
         )}
      </div>
   );
}
