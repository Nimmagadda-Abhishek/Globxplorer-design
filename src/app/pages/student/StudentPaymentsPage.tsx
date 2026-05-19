import {
   CreditCard,
   Receipt,
   Clock,
   CheckCircle2,
   ArrowUpRight,
   Download,
   Info,
   Calendar,
   AlertCircle,
   Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { studentPortalApi } from "../../../lib/api";

const loadRazorpayScript = () => {
   return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
   });
};

export function StudentPaymentsPage() {
   const [loading, setLoading] = useState(true);
   const [payments, setPayments] = useState<any[]>([]);
   const [processingId, setProcessingId] = useState<string | null>(null);

   const fetchPayments = async () => {
      try {
         setLoading(true);
         const [paymentsRes, requestsRes] = await Promise.all([
            studentPortalApi.payment.getAll().catch(() => ({ success: true, data: [] })),
            studentPortalApi.payment.getMyRequests().catch(() => ({ success: true, data: [] }))
         ]);

         let combinedPayments = [];
         if (paymentsRes?.success && Array.isArray(paymentsRes.data)) {
            combinedPayments = [...paymentsRes.data];
         }
         if (requestsRes?.success && Array.isArray(requestsRes.data)) {
            // Avoid duplicates if the backend already includes requests in getAll
            const existingIds = new Set(combinedPayments.map((p: any) => p._id || p.id));
            const newRequests = requestsRes.data.filter((r: any) => !existingIds.has(r._id || r.id));
            combinedPayments = [...combinedPayments, ...newRequests];
         }

         setPayments(combinedPayments);
      } catch (err) {
         console.error("Failed to fetch payments", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchPayments();
   }, []);

   const dues = payments.filter(p => p.status?.toLowerCase() === 'pending').map(p => ({
      id: p._id || p.id,
      title: p.title || p.description || "Fee Payment",
      amount: typeof p.amount === 'number' ? `₹${p.amount.toLocaleString()}` : p.amount,
      rawAmount: p.amount,
      due: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "TBD",
      status: 'Pending'
   }));

   const history = payments.filter(p => 
      ['paid', 'failed', 'created'].includes(p.status?.toLowerCase())
   ).map(p => {
      const rawStatus = p.status?.toLowerCase();
      let displayStatus = 'Paid';
      if (rawStatus === 'failed' || rawStatus === 'created') displayStatus = 'Failed';

      return {
         id: p._id || p.id,
         title: p.title || p.description || "Fee Payment",
         amount: typeof p.amount === 'number' ? `₹${p.amount.toLocaleString()}` : p.amount,
         date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A"),
         method: p.paymentMethod || "Razorpay",
         status: displayStatus
      };
   });

   const totalPaid = payments
      .filter(p => p.status?.toLowerCase() === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

   const handlePay = async (due: any) => {
      try {
         setProcessingId(due.id);

         const orderRes = await studentPortalApi.payment.pay(due.id);
         const orderData = orderRes?.data || orderRes;
         
         // Extract order details - backend might return { order, paymentRecord } or just order info
         const razorpayOrder = orderData?.order || orderData;
         const orderId = razorpayOrder?.id || orderData?.orderId || orderData?.id;

         if (!orderId) {
            console.error("Order creation response:", orderRes);
            throw new Error("Failed to create order. Please try again later.");
         }

         const res = await loadRazorpayScript();
         if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setProcessingId(null);
            return;
         }

         const options = {
            key: orderData.key || "rzp_live_SdqWyTY0C7UH7A",
            amount: razorpayOrder.amount || orderData.amount || (due.rawAmount * 100),
            currency: razorpayOrder.currency || orderData.currency || "INR",
            name: "GlobXplore",
            description: `Payment: ${due.title}`,
            order_id: orderId,
            handler: async function (response: any) {
               console.log("[Razorpay Fee] Payment Success Response:", response);
               try {
                  console.log("[Razorpay Fee] Initiating server-side verification...");
                  const verifyRes = await studentPortalApi.payment.verifyPayment({
                     razorpayOrderId: response.razorpay_order_id,
                     razorpayPaymentId: response.razorpay_payment_id,
                     razorpaySignature: response.razorpay_signature,
                  });
                  console.log("[Razorpay Fee] Verification Result:", verifyRes);
                  alert("Payment successful!");
                  window.location.reload();
               } catch (err: any) {
                  console.error("[Razorpay Fee] Verification Failed:", err);
                  alert("Payment verification failed. Please contact support.");
                  setProcessingId(null);
               }
            },
            prefill: {
               name: localStorage.getItem("userName") || "",
               email: "",
               contact: ""
            },
            theme: {
               color: "#4F46E5"
            },
            modal: {
               ondismiss: function () {
                  setProcessingId(null);
               }
            }
         };

         const paymentObject = new (window as any).Razorpay(options);
         paymentObject.on("payment.failed", function (response: any) {
            alert("Payment failed: " + response.error.description);
            setProcessingId(null);
         });

         paymentObject.open();

      } catch (err: any) {
         console.error("Payment error", err);
         alert(err.message || "Payment failed or cancelled.");
         setProcessingId(null);
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Dues</h1>
               <p className="text-slate-500 mt-1 font-medium">Keep track of your university fees and service payments.</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Download Statement
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Pending Dues */}
               <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900">Pending Payments</h2>
                  <div className="grid grid-cols-1 gap-4">                 {dues.length > 0 ? dues.map((due, i) => (
                     <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${due.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                              }`}>
                              <Clock className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-base font-black text-slate-900">{due.title}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Due Date: {due.due}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-lg font-black text-slate-900">{due.amount}</p>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${due.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                 }`}>
                                 {due.status}
                              </span>
                           </div>
                           <button
                              onClick={() => handlePay(due)}
                              disabled={processingId === due.id}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-2"
                           >
                              {processingId === due.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Pay Now"}
                           </button>
                        </div>
                     </div>
                  )) : (
                     <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-sm font-medium text-slate-500">No pending payments found.</p>
                     </div>
                  )}
                  </div>
               </div>

               {/* Payment History */}
               <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900">Transaction History</h2>
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50/50">
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                 <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {history.map((row, i) => (
                                 <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                             <CheckCircle2 className="w-4 h-4" />
                                          </div>
                                          <span className="text-sm font-black text-slate-900">{row.title}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{row.date}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{row.method}</td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900">{row.amount}</td>
                                    <td className="px-8 py-5 text-right">
                                       <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                          <Download className="w-4 h-4" />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>

            {/* Payment Sidebar */}
            <div className="space-y-8">
               <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                  <div className="relative z-10">
                     <h3 className="text-xl font-black mb-2">Total Paid</h3>
                     <p className="text-4xl font-black mb-1">₹{totalPaid.toLocaleString()}</p>
                     <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-8">Academic Year 2024-25</p>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                           <span className="text-xs font-bold">University Fees</span>
                           <span className="text-xs font-black">₹{payments.filter(p => p.status === 'paid' && p.category === 'university').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                           <span className="text-xs font-bold">Service Fees</span>
                           <span className="text-xs font-black">₹{payments.filter(p => p.status === 'paid' && p.category !== 'university').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6">Payment Methods</h3>
                  <div className="space-y-3">
                     <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <CreditCard className="w-5 h-5 text-indigo-600" />
                           <span className="text-sm font-black text-slate-900">Credit / Debit Card</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                     </div>
                     <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                           <LandmarkIcon className="w-5 h-5 text-slate-400" />
                           <span className="text-sm font-black text-slate-600">Net Banking</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300" />
                     </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                     <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                     <p className="text-[10px] font-medium text-blue-700 leading-relaxed">
                        International transfers may take 3-5 business days to reflect in your portal.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function LandmarkIcon(props: any) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <line x1="3" y1="21" x2="21" y2="21" />
         <line x1="3" y1="7" x2="21" y2="7" />
         <polyline points="3 7 12 2 21 7" />
         <line x1="5" y1="21" x2="5" y2="7" />
         <line x1="9" y1="21" x2="9" y2="7" />
         <line x1="13" y1="21" x2="13" y2="7" />
         <line x1="17" y1="21" x2="17" y2="7" />
      </svg>
   )
}

