import {
  Check,
  ShieldCheck,
  Crown,
  Star,
  Sparkles,
  CreditCard,
  ArrowRight,
  Loader2,
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


/* =========================================================
   COMPONENT
========================================================= */

export function StudentSubscriptionPage() {

  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState<any[]>([]);

  const [currentPlan, setCurrentPlan] = useState<any>(null);

  const [processingId, setProcessingId] = useState<string | null>(null);

  /*
   * Stores which plans have their complete feature list visible.
   *
   * Example:
   *
   * {
   *   "basic": true,
   *   "premium": false
   * }
   */
  const [expandedPlans, setExpandedPlans] = useState<
    Record<string, boolean>
  >({});


  /* =========================================================
     FETCH PLANS
  ========================================================= */

  useEffect(() => {

    const fetchPlans = async () => {

      try {

        setLoading(true);

        const res =
          await studentPortalApi.subscription
            .getPlans()
            .catch(() => null);

        const dashRes =
          await studentPortalApi.dashboard
            .get()
            .catch(() => null);

        const dashData =
          dashRes?.data || dashRes;


        /*
         * Make sure plans is always an array.
         */

        const plansArray = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];


        /*
         * Add UI defaults if backend does not provide them.
         */

        const enrichedPlans = plansArray.map((p: any) => ({

          ...p,

          id: p._id || p.id,

          tagline:
            p.tagline ||
            (
              p.name === "Basic"
                ? "Essential Start"
                : p.name === "Premium"
                  ? "Most Recommended"
                  : "Ultimate Experience"
            ),

          icon:
            p.icon ||
            (
              p.name === "Basic"
                ? "Star"
                : p.name === "Premium"
                  ? "ShieldCheck"
                  : "Crown"
            ),

          popular:
            p.popular ||
            p.name === "Premium",

          features:
            Array.isArray(p.features)
              ? p.features
              : [],

        }));


        if (enrichedPlans.length > 0) {

          setPlans(enrichedPlans);

        } else {

          setPlans([]);

        }


        /*
         * Current subscription.
         */

        if (dashData?.subscription) {

          setCurrentPlan(
            dashData.subscription
          );

        } else {

          setCurrentPlan(null);

        }

      } catch (err) {

        console.error(
          "Failed to fetch plans",
          err
        );

      } finally {

        setLoading(false);

      }

    };


    fetchPlans();

  }, []);


  /* =========================================================
     TOGGLE FEATURES
  ========================================================= */

  const toggleFeatures = (
    planId: string
  ) => {

    setExpandedPlans((prev) => ({

      ...prev,

      [planId]:
        !prev[planId],

    }));

  };


  /* =========================================================
     PAYMENT
  ========================================================= */

  const handlePayment = async (
    plan: any
  ) => {

    try {

      setProcessingId(
        plan.id
      );


      /*
       * Create Razorpay order.
       */

      const orderRes =
        await studentPortalApi.subscription.createOrder({
          planId: plan.id,
        });


      const orderData =
        orderRes?.data ||
        orderRes;


      const orderId =
        orderData?.orderId;


      const orderAmount =
        orderData?.amount;


      if (!orderId) {

        throw new Error(
          "Failed to create order. Please try again later."
        );

      }


      /*
       * Load Razorpay.
       */

      const res =
        await loadRazorpayScript();


      if (!res) {

        alert(
          "Razorpay SDK failed to load. Are you online?"
        );

        setProcessingId(null);

        return;

      }


      /*
       * Razorpay configuration.
       */

      const options = {

        key:
          "rzp_live_SdqWyTY0C7UH7A",

        amount:
          orderAmount,

        currency:
          orderData.currency ||
          "INR",

        name:
          "GlobXplore",

        description:
          `Subscription: ${plan.name}`,

        order_id:
          orderId,


        /*
         * Payment success.
         */

        handler:
          async function (
            response: any
          ) {

            console.log(
              "[Razorpay] Payment Success Response:",
              response
            );

            try {

              console.log(
                "[Razorpay] Initiating server-side verification..."
              );


              const verifyRes =
                await studentPortalApi.subscription.verifyPayment({

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  planId:
                    plan.id,

                });


              console.log(
                "[Razorpay] Verification Result:",
                verifyRes
              );


              alert(
                "Payment successful! Plan upgraded."
              );


              window.location.reload();


            } catch (err) {

              console.error(
                "[Razorpay] Verification Failed:",
                err
              );


              alert(
                "Payment verification failed. Please contact support."
              );


              setProcessingId(null);

            }

          },


        /*
         * Customer information.
         */

        prefill: {

          name: "",

          email: "",

          contact: "",

        },


        /*
         * Razorpay theme.
         */

        theme: {

          color:
            "#4F46E5",

        },


        /*
         * Close handler.
         */

        modal: {

          ondismiss:
            function () {

              setProcessingId(
                null
              );

            },

        },

      };


      /*
       * Open Razorpay.
       */

      const paymentObject =
        new (window as any).Razorpay(
          options
        );


      /*
       * Payment failed.
       */

      paymentObject.on(
        "payment.failed",
        function (
          response: any
        ) {

          alert(
            "Payment failed: " +
            response.error.description
          );


          setProcessingId(
            null
          );

        }
      );


      paymentObject.open();


    } catch (err: any) {

      console.error(
        "Payment error",
        err
      );


      alert(
        err.message ||
        "Payment failed or cancelled."
      );


      setProcessingId(
        null
      );

    }

  };


  /* =========================================================
     PLAN ICON
  ========================================================= */

  const getIcon = (
    iconStr: string
  ) => {

    if (
      iconStr === "Star"
    ) {
      return Star;
    }


    if (
      iconStr === "Crown"
    ) {
      return Crown;
    }


    return ShieldCheck;

  };


  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <Loader2
            className="
              w-8
              h-8
              text-indigo-600
              animate-spin
            "
          />

          <p className="text-sm font-medium text-slate-500">
            Loading subscription plans...
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (plans.length === 0) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center px-4">

        <div className="text-center max-w-md">

          <div className="
            w-16
            h-16
            mx-auto
            rounded-2xl
            bg-slate-100
            flex
            items-center
            justify-center
            text-slate-400
          ">

            <CreditCard className="w-7 h-7" />

          </div>


          <h2 className="
            mt-5
            text-xl
            font-black
            text-slate-900
          ">
            No subscription plans available
          </h2>


          <p className="
            mt-2
            text-sm
            text-slate-500
            leading-relaxed
          ">
            Subscription plans are currently unavailable.
            Please check again later.
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (

    <div className="
      w-full
      max-w-7xl
      mx-auto
      px-4
      sm:px-6
      lg:px-8
      py-6
      sm:py-8
      lg:py-10
      space-y-8
      sm:space-y-10
      animate-in
      fade-in
      slide-in-from-bottom-4
      duration-700
    ">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="
        text-center
        max-w-3xl
        mx-auto
      ">

        <div className="
          inline-flex
          items-center
          gap-2
          px-3
          py-1.5
          bg-indigo-50
          text-indigo-600
          rounded-full
          text-[10px]
          sm:text-xs
          font-black
          uppercase
          tracking-widest
        ">

          <Sparkles className="w-3.5 h-3.5" />

          Premium Membership

        </div>


        <h1 className="
          mt-4
          text-3xl
          sm:text-4xl
          lg:text-5xl
          font-black
          text-slate-900
          tracking-tight
        ">

          Upgrade Your Success

        </h1>


        <p className="
          text-slate-500
          mt-3
          text-sm
          sm:text-base
          lg:text-lg
          font-medium
          leading-relaxed
          max-w-2xl
          mx-auto
        ">

          Choose a plan that fits your goals.
          Unlock premium tools and personalized guidance.

        </p>

      </div>


      {/* =====================================================
          CURRENT PLAN
      ===================================================== */}

      {currentPlan?.active && (

        <div className="
          flex
          justify-center
        ">

          <div className="
            w-full
            sm:w-auto
            px-4
            sm:px-6
            py-3
            bg-indigo-600
            rounded-2xl
            sm:rounded-[2rem]
            text-white
            flex
            flex-col
            sm:flex-row
            items-center
            justify-center
            gap-2
            sm:gap-3
            shadow-xl
            shadow-indigo-100
            text-center
          ">

            <div className="flex items-center gap-2">

              <Sparkles className="
                w-4
                h-4
                sm:w-5
                sm:h-5
                text-amber-300
              " />

              <span className="font-bold text-xs sm:text-sm">

                Your Current Plan:

                <span className="
                  uppercase
                  tracking-widest
                  font-black
                  ml-1
                ">
                  {currentPlan.plan}
                </span>

              </span>

            </div>


            <div className="
              hidden
              sm:block
              h-4
              w-px
              bg-indigo-400
            " />


            <span className="
              text-[11px]
              sm:text-xs
              font-bold
              text-indigo-100
            ">

              Expires in{" "}
              {currentPlan.expiry || "184 days"}

            </span>

          </div>

        </div>

      )}


      {/* =====================================================
          PLANS
      ===================================================== */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-5
        sm:gap-6
        lg:gap-8
        items-start
      ">

        {plans.map(
          (
            plan: any
          ) => {

            const planKey =
              plan.id ||
              plan.name;


            const isExpanded =
              !!expandedPlans[
                planKey
              ];


            const isActive =
              currentPlan?.plan
                ?.toLowerCase() ===
              plan.name?.toLowerCase();


            const Icon =
              typeof plan.icon === "string"
                ? getIcon(plan.icon)
                : plan.icon ||
                  ShieldCheck;


            const features =
              Array.isArray(plan.features)
                ? plan.features
                : [];


            const visibleFeatures =
              isExpanded
                ? features
                : features.slice(0, 4);


            const hasMoreFeatures =
              features.length > 4;


            return (

              <div
                key={planKey}
                className={`
                  relative
                  p-5
                  sm:p-6
                  lg:p-8
                  rounded-3xl
                  border
                  transition-all
                  duration-300
                  flex
                  flex-col

                  ${
                    isActive
                      ? `
                        bg-white
                        border-indigo-500
                        shadow-2xl
                        shadow-indigo-100
                        xl:-translate-y-2
                        z-10
                      `
                      : `
                        bg-white
                        border-slate-200
                        shadow-sm
                        hover:shadow-xl
                        hover:-translate-y-1
                        hover:border-slate-300
                      `
                  }
                `}
              >

                {/* =================================================
                    POPULAR BADGE
                ================================================= */}

                {plan.popular && (

                  <div className="
                    absolute
                    -top-3
                    left-1/2
                    -translate-x-1/2
                    px-4
                    py-1.5
                    bg-indigo-600
                    text-white
                    text-[9px]
                    sm:text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    rounded-full
                    whitespace-nowrap
                    shadow-lg
                    shadow-indigo-200
                  ">

                    Most Popular

                  </div>

                )}


                {/* =================================================
                    PLAN ICON
                ================================================= */}

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <div
                    className={`
                      w-12
                      h-12
                      sm:w-14
                      sm:h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center

                      ${
                        isActive
                          ? `
                            bg-indigo-600
                            text-white
                          `
                          : `
                            bg-slate-100
                            text-slate-500
                          `
                      }
                    `}
                  >

                    <Icon className="
                      w-6
                      h-6
                      sm:w-7
                      sm:h-7
                    " />

                  </div>


                  {/* Active Badge */}

                  {isActive && (

                    <span className="
                      px-2.5
                      py-1
                      rounded-full
                      bg-emerald-50
                      text-emerald-600
                      text-[9px]
                      font-black
                      uppercase
                      tracking-wider
                    ">

                      Active

                    </span>

                  )}

                </div>


                {/* =================================================
                    PLAN NAME
                ================================================= */}

                <div className="mt-5">

                  <h3 className="
                    text-xl
                    sm:text-2xl
                    font-black
                    text-slate-900
                  ">

                    {plan.name}

                  </h3>


                  <p className="
                    text-slate-500
                    font-bold
                    mt-1
                    uppercase
                    tracking-widest
                    text-[10px]
                    sm:text-xs
                  ">

                    {plan.tagline}

                  </p>

                </div>


                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="mt-5 sm:mt-6">

                  <div className="
                    flex
                    items-baseline
                    gap-1
                    flex-wrap
                  ">

                    <span className="
                      text-3xl
                      sm:text-4xl
                      font-black
                      text-slate-900
                    ">

                      {
                        typeof plan.price === "number"
                          ? `₹${plan.price.toLocaleString()}`
                          : plan.price
                      }

                    </span>


                    <span className="
                      text-slate-400
                      font-bold
                      text-xs
                      sm:text-sm
                    ">

                      /one-time

                    </span>

                  </div>


                  {plan.price > 0 && (

                    <span className="
                      inline-block
                      text-[10px]
                      font-bold
                      text-slate-400
                      mt-1
                    ">

                      + 18% GST

                    </span>

                  )}

                </div>


                {/* =================================================
                    FEATURES
                ================================================= */}

                <div className="mt-7">

                  <div className="space-y-3.5">

                    {visibleFeatures.map(
                      (
                        feature: string,
                        index: number
                      ) => (

                        <div
                          key={index}
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <div
                            className={`
                              flex-shrink-0
                              w-5
                              h-5
                              mt-0.5
                              rounded-full
                              flex
                              items-center
                              justify-center

                              ${
                                isActive
                                  ? `
                                    bg-indigo-100
                                    text-indigo-600
                                  `
                                  : `
                                    bg-slate-100
                                    text-slate-500
                                  `
                              }
                            `}
                          >

                            <Check className="w-3 h-3" />

                          </div>


                          <span className="
                            text-sm
                            font-medium
                            text-slate-600
                            leading-5
                          ">

                            {feature}

                          </span>

                        </div>

                      )
                    )}

                  </div>


                  {/* =================================================
                      READ MORE / SHOW LESS
                  ================================================= */}

                  {hasMoreFeatures && (

                    <div className="relative mt-5 pt-1">

                      {!isExpanded && (

                        <div className="
                          absolute
                          left-0
                          right-0
                          -top-8
                          h-8
                          bg-gradient-to-t
                          from-white
                          to-transparent
                          pointer-events-none
                        " />

                      )}


                      <button
                        type="button"
                        onClick={() =>
                          toggleFeatures(
                            planKey
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          font-bold
                          text-indigo-600
                          hover:text-indigo-700
                          transition-colors
                          group
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-indigo-500
                          focus-visible:ring-offset-2
                          rounded-lg
                          py-1
                        "
                        aria-expanded={
                          isExpanded
                        }
                      >

                        {isExpanded
                          ? "Show less"
                          : `Read more (${features.length - 4} more)`
                        }


                        <ArrowRight
                          className={`
                            w-4
                            h-4
                            transition-transform
                            duration-200

                            ${
                              isExpanded
                                ? "-rotate-90"
                                : "group-hover:translate-x-1"
                            }
                          `}
                        />

                      </button>

                    </div>

                  )}

                </div>


                {/* =================================================
                    PAYMENT BUTTON
                ================================================= */}

                <div className="
                  mt-8
                  pt-5
                  border-t
                  border-slate-100
                ">

                  {isActive ? (

                    <button
                      type="button"
                      disabled
                      className="
                        w-full
                        py-3.5
                        sm:py-4
                        bg-slate-100
                        text-slate-400
                        rounded-xl
                        sm:rounded-2xl
                        font-black
                        text-sm
                        cursor-not-allowed
                      "
                    >

                      Current Active Plan

                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={() =>
                        handlePayment(
                          plan
                        )
                      }
                      disabled={
                        processingId ===
                        plan.id
                      }
                      className="
                        w-full
                        py-3.5
                        sm:py-4
                        bg-slate-900
                        text-white
                        rounded-xl
                        sm:rounded-2xl
                        font-black
                        text-sm
                        hover:bg-indigo-600
                        active:scale-[0.98]
                        transition-all
                        shadow-lg
                        shadow-slate-200
                        disabled:opacity-70
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >

                      {processingId ===
                        plan.id && (

                        <Loader2
                          className="
                            w-4
                            h-4
                            animate-spin
                          "
                        />

                      )}

                      {processingId ===
                      plan.id
                        ? "Processing..."
                        : "Pay Now"}

                    </button>

                  )}

                </div>

              </div>

            );

          }
        )}

      </div>


      {/* =========================================================
          PAYMENT SECURITY
      ========================================================= */}

      <div className="
        bg-white
        border
        border-slate-100
        rounded-2xl
        sm:rounded-3xl
        p-5
        sm:p-6
        lg:p-8
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-5
        sm:gap-6
        shadow-sm
      ">

        <div className="
          flex
          items-center
          gap-4
          text-center
          sm:text-left
        ">

          <div className="
            w-11
            h-11
            sm:w-12
            sm:h-12
            shrink-0
            bg-indigo-50
            rounded-xl
            sm:rounded-2xl
            flex
            items-center
            justify-center
            text-indigo-600
          ">

            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />

          </div>


          <div>

            <h4 className="
              text-base
              sm:text-lg
              font-black
              text-slate-900
            ">

              Secure Payments

            </h4>


            <p className="
              text-xs
              sm:text-sm
              font-medium
              text-slate-500
              mt-0.5
            ">

              Industry-standard encryption for all transactions.

            </p>

          </div>

        </div>


        <div className="
          flex
          items-center
          justify-center
          gap-5
          sm:gap-8
          opacity-50
          grayscale
        ">

          <span className="
            font-black
            italic
            text-base
            sm:text-xl
          ">
            RAZORPAY
          </span>

          <span className="
            font-black
            italic
            text-base
            sm:text-xl
          ">
            VISA
          </span>

          <span className="
            font-black
            italic
            text-base
            sm:text-xl
          ">
            MASTERCARD
          </span>

        </div>

      </div>


      {/* =========================================================
          FOOTNOTE
      ========================================================= */}

      <p className="
        text-center
        text-[11px]
        sm:text-xs
        text-slate-400
        font-medium
        max-w-2xl
        mx-auto
        leading-relaxed
      ">

        By continuing with your purchase, you agree to the applicable
        subscription terms and payment conditions.

      </p>

    </div>

  );

}

