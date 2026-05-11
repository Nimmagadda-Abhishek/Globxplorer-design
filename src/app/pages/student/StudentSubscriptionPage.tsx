import { Check, ShieldCheck, Crown, Star, Sparkles, CreditCard, ArrowRight, Loader2 } from "lucide-react";
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

export function StudentSubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Fetch plans
        const res = await studentPortalApi.subscription.getPlans().catch(() => null);
        const dashRes = await studentPortalApi.dashboard.get().catch(() => null);
        const dashData = dashRes?.data || dashRes;

        let plansArray = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

        // Enrich data with UI fields if missing
        const enrichedPlans = plansArray.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          tagline: p.tagline || (p.name === 'Basic' ? 'Essential Start' : p.name === 'Premium' ? 'Most Recommended' : 'Ultimate Experience'),
          icon: p.icon || (p.name === 'Basic' ? 'Star' : p.name === 'Premium' ? 'ShieldCheck' : 'Crown'),
          popular: p.popular || (p.name === 'Premium'),
          features: Array.isArray(p.features) ? p.features : []
        }));

        if (enrichedPlans.length > 0) {
          setPlans(enrichedPlans);
        } else {
          setPlans([]);
        }

        if (dashData?.subscription) {
          setCurrentPlan(dashData.subscription);
        } else {
          setCurrentPlan(null);
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePayment = async (plan: any) => {
    try {
      setProcessingId(plan.id);
      const orderRes = await studentPortalApi.subscription.createOrder({ planId: plan.id });

      const orderData = orderRes?.data || orderRes;
      const orderId = orderData?.orderId;
      const orderAmount = orderData?.amount; // This is already in paise from backend

      if (!orderId) {
        throw new Error("Failed to create order. Please try again later.");
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setProcessingId(null);
        return;
      }

      const options = {
        key: "rzp_live_SdqWyTY0C7UH7A", // Actual Razorpay test key from .env
        amount: orderAmount, // paise from backend
        currency: orderData.currency || "INR",
        name: "GlobXplorer",
        description: `Subscription: ${plan.name}`,
        order_id: orderId, // The order_id from backend
        handler: async function (response: any) {
          console.log("[Razorpay] Payment Success Response:", response);
          try {
            console.log("[Razorpay] Initiating server-side verification...");
            const verifyRes = await studentPortalApi.subscription.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id
            });
            console.log("[Razorpay] Verification Result:", verifyRes);
            alert("Payment successful! Plan upgraded.");
            window.location.reload();
          } catch (err: any) {
            console.error("[Razorpay] Verification Failed:", err);
            alert("Payment verification failed. Please contact support.");
            setProcessingId(null);
          }
        },
        prefill: {
          name: "",
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

  const getIcon = (iconStr: string) => {
    if (iconStr === "Star") return Star;
    if (iconStr === "Crown") return Crown;
    return ShieldCheck;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }


  console.log("Current plans in state:", plans);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Upgrade Your Success</h1>
        <p className="text-slate-500 mt-3 text-lg font-medium">Choose a plan that fits your goals. Unlock premium tools and personalized guidance.</p>
      </div>

      {/* Active Subscription Badge */}
      {currentPlan?.active && (
        <div className="flex justify-center">
          <div className="px-6 py-3 bg-indigo-600 rounded-[2rem] text-white flex items-center gap-3 shadow-xl shadow-indigo-100">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm">Your Current Plan: <span className="uppercase tracking-widest font-black">{currentPlan.plan}</span></span>
            <div className="h-4 w-px bg-indigo-400"></div>
            <span className="text-xs font-bold text-indigo-100">Expires in {currentPlan.expiry || "184 days"}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {plans.map((plan: any) => {
          const isActive = currentPlan?.plan?.toLowerCase() === plan.name.toLowerCase();
          const Icon = typeof plan.icon === 'string' ? getIcon(plan.icon) : (plan.icon || ShieldCheck);

          return (
            <div
              key={plan.name}
              className={`relative p-8 rounded-[3rem] border transition-all duration-500 ${isActive
                  ? 'bg-white border-indigo-500 shadow-2xl shadow-indigo-100 scale-105 z-10'
                  : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                <Icon className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">{plan.tagline}</p>

              <div className="mt-6 flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    {typeof plan.price === 'number' ? `₹${plan.price.toLocaleString()}` : plan.price}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">/one-time</span>
                </div>
                {plan.price > 0 && <span className="text-[10px] font-bold text-slate-400 ml-1">+ 18% GST</span>}
              </div>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                      }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-3">
                {isActive ? (
                  <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm cursor-not-allowed">
                    Current Active Plan
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handlePayment(plan)}
                      disabled={processingId === (plan.id || plan.name)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {processingId === (plan.id || plan.name) && <Loader2 className="w-4 h-4 animate-spin" />}
                      Pay Now (Razorpay)
                    </button>
                    <button className="w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all">
                      Request Upgrade
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Payment Security Footer */}
      <div className="mt-16 bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Secure Payments</h4>
            <p className="text-sm font-medium text-slate-500">Industry-standard encryption for all transactions.</p>
          </div>
        </div>
        <div className="flex items-center gap-8 opacity-50 grayscale">
          <span className="font-black italic text-xl">RAZORPAY</span>
          <span className="font-black italic text-xl">VISA</span>
          <span className="font-black italic text-xl">MASTERCARD</span>
        </div>
      </div>
    </div>
  );
}
