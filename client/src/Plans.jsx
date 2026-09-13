import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createSubscription } from "./api/subscriptionApi";
import { fetchUser } from "./api/userApi";
import DirectoryHeader from "./components/DirectoryHeader";

const PLAN_CATALOG = {
  monthly: [
    {
      id: "plan_TGRAbkdGNSE6P2",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 199,
      period: "/mo",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
      color: "border-gray-200 dark:border-zinc-800 hover:border-emerald-500",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669]",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150"
    },
    {
      id: "plan_TGRBqGH2twaqUF",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 399,
      period: "/mo",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: true,
      color: "border-amber-500 ring-2 ring-amber-500/10 dark:ring-amber-500/5",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-md shadow-emerald-100 dark:shadow-none",
      badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-150"
    },
    {
      id: "plan_TGRD4RZ6EvIIGF",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 699,
      period: "/mo",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
      color: "border-gray-200 dark:border-zinc-800 hover:border-emerald-500",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669]",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150"
    },
  ],
  yearly: [
    {
      id: "plan_TGRERxZ8QHFziv",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 1999,
      period: "/yr",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
      color: "border-gray-200 dark:border-zinc-800 hover:border-emerald-500",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669]",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150"
    },
    {
      id: "plan_TGRFKvDlcRr493",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 3999,
      period: "/yr",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: true,
      color: "border-amber-500 ring-2 ring-amber-500/10 dark:ring-amber-500/5",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-md shadow-emerald-100 dark:shadow-none",
      badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-150"
    },
    {
      id: "plan_TGRHXMlO3xJVec",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 6999,
      period: "/yr",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
      color: "border-gray-200 dark:border-zinc-800 hover:border-emerald-500",
      btnColor: "bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669]",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150"
    },
  ],
};

export default function Plans() {
  const [mode, setMode] = useState("monthly");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const plans = PLAN_CATALOG[mode];

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchUser();
        setCurrentUser(data);
      } catch {
        setCurrentUser(null);
      }
    }
    loadUser();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const existing = document.getElementById("razorpay-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function handleSelect(plan) {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay payment gateway. Please check your internet connection.");
        return;
      }
      const { subscriptionId } = await createSubscription(plan.id);
      console.log(subscriptionId);
      openRazorpayPopup({ subscriptionId });
    } catch (err) {
      console.error("Subscription purchase initiation failed:", err);
    }
  }

  const isCurrentPlan = (planName) => {
    if (!currentUser) return false;
    const tb = 1024 ** 4;
    const userMax = currentUser.maxStorageInBytes;

    if (planName === "Starter" && (userMax === 2 * tb || userMax === 5 * tb)) {
      return true;
    }
    if (planName === "Pro" && (userMax === 2 * tb || userMax === 10 * tb)) {
      return true;
    }
    if (planName === "Ultimate" && (userMax === 5 * tb || userMax === 10 * tb)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Navigation Bar */}
        <div className="pt-4">
          <DirectoryHeader />
        </div>

        {/* Hero Pricing Header */}
        <div className="text-center max-w-3xl mx-auto mt-12 mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-zinc-400 font-medium">
            Secure, reliable cloud storage for everyone. Choose from our high-performance tiers to scale your vault instantly.
          </p>
        </div>

        {/* Pricing Mode Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <button
              onClick={() => setMode("monthly")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                mode === "monthly"
                  ? "bg-gradient-to-r from-[#f59e0b] to-[#10b981] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setMode("yearly")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                mode === "yearly"
                  ? "bg-gradient-to-r from-[#f59e0b] to-[#10b981] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
              }`}
            >
              Yearly
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                mode === "yearly" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Cards Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.popular;
            const current = isCurrentPlan(plan.name);

            return (
              <div
                key={`${mode}-${plan.id}`}
                className={`relative flex flex-col rounded-3xl p-6 bg-white dark:bg-zinc-900 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.color}`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#f59e0b] to-[#10b981] text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm animate-pulse">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">{plan.name}</h3>
                    <span className={`text-[10px] font-extrabold border rounded-lg px-2.5 py-0.5 tracking-wide uppercase flex-shrink-0 ${plan.badgeColor}`}>
                      {plan.storage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-0.5 mb-6">
                  <span className="text-lg font-bold text-gray-800 dark:text-zinc-200">₹</span>
                  <span className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-zinc-100">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold ml-1">
                    {plan.period === "/mo" ? "/ month" : "/ year"}
                  </span>
                </div>

                <ul className="mb-8 space-y-3.5 flex-1 text-xs text-gray-600 dark:text-zinc-400 font-semibold font-sans">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-emerald-500 text-sm font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={current}
                  className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    current
                      ? "bg-emerald-500 text-white cursor-default shadow-sm"
                      : `${plan.btnColor} text-white hover:shadow-md`
                  }`}
                >
                  {current ? "Current Plan" : "Subscribe Now"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Small helper text */}
        <p className="mt-12 text-center text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
          Prices are indicative for demo. Integrate with Razorpay Subscriptions to start billing.
        </p>
      </div>
    </div>
  );
}

function openRazorpayPopup({ subscriptionId }) {
  console.log(subscriptionId);
  const rzp = new window.Razorpay({
    key: "rzp_test_TGV5JcN9Yemgac",
    description: "Cloud storage vault subscription.",
    name: "ApexVault Pro",
    subscription_id: subscriptionId,
    image: `${window.location.origin}/procodrr.png`,
    notes: {},
    handler: async function (response) {
      console.log("Razorpay payment response:", response);
      alert("Payment successful! Your vault size will be upgraded shortly.");
    },
  });

  rzp.on("payment.failed", function (response) {
    console.error("Razorpay payment failed:", response);
    alert("Payment failed. Please try again.");
  });

  rzp.open();
}