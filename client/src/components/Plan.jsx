import { useState } from "react";
import { useClerk, useUser, useAuth } from "@clerk/clerk-react";
import { Check, Loader2, CreditCard } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Plan = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [loading, setLoading] = useState(false);

  const isPremium =
    user?.publicMetadata?.plan === "premium" ||
    user?.privateMetadata?.plan === "premium";

  const handleSubscribe = async (planId = "premium") => {
    if (!user) {
      openSignIn();
      return;
    }

    if (isPremium) {
      toast.success("You are already on the Premium Plan!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Initializing Stripe Checkout...", { id: "stripe-toast" });

      let token = "";
      try {
        token = await getToken();
      } catch (tErr) {
        console.warn("Token fetch note:", tErr);
      }

      const { data } = await axios.post(
        "/api/stripe/create-checkout-session",
        { planId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (data.success && data.url) {
        toast.success("Redirecting to Stripe...", { id: "stripe-toast" });
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Failed to initialize payment", { id: "stripe-toast" });
        setLoading(false);
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error(error.response?.data?.message || "Stripe connection failed", {
        id: "stripe-toast",
      });
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="px-6 md:px-12 xl:px-24 py-24 bg-[#09090B] relative tracking-[-0.02em]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-6xl font-semibold text-white tracking-[-0.03em] leading-tight">
          Transparent pricing for everyone<span className="text-[#FF4D5E]">.</span>
        </h2>
        <p className="text-gray-400 mt-4 text-base sm:text-lg max-w-xl mx-auto font-medium">
          Start for free and scale as you grow. Secured by Stripe Payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 mb-4">
              Starter
            </div>
            <h3 className="text-2xl font-semibold text-white">Free Plan</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">Perfect for exploring Aven AI features.</p>
            <div className="mt-6 mb-6">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-gray-400 text-sm font-medium"> / month</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-300 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>10 Free AI Articles & Blog Titles</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>Access to AI Image Generator</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>Browse & Share in Community Gallery</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              if (!user) openSignIn();
              else if (isPremium) toast.info("You are currently on the Premium Plan!");
              else toast.success("You are on the Free Starter Plan!");
            }}
            className="mt-8 w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition cursor-pointer tracking-[-0.02em]"
          >
            {!user ? "Get Started Free" : isPremium ? "Free Starter Plan" : "Current Plan"}
          </button>
        </div>

        {/* Premium Plan with Stripe Integration */}
        <div className={`bg-white/[0.04] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all ${isPremium ? "border-2 border-[#FF4D5E] shadow-[0_0_30px_rgba(255,77,94,0.15)]" : "border-2 border-white/20"}`}>
          <div className="absolute top-4 right-4 bg-[#FF4D5E] text-white font-bold text-xs px-3.5 py-1 rounded-full shadow-md">
            {isPremium ? "Active" : "Popular"}
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#FF4D5E] mb-4">
              Pro Creator
            </div>
            <h3 className="text-2xl font-semibold text-white">Premium Plan</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">Unlimited power for creators & professionals.</p>
            <div className="mt-6 mb-6">
              <span className="text-5xl font-extrabold text-white">$19</span>
              <span className="text-gray-400 text-sm font-medium"> / month</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>Unlimited AI Articles & Blog Titles</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>High Resolution AI Text-to-Image</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>AI Background & Object Removal</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                <span>Full ATS Resume Reviewer (PDF)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe("premium")}
            disabled={loading || isPremium}
            className={`mt-8 w-full py-3.5 px-4 rounded-xl font-semibold transition cursor-pointer tracking-[-0.02em] flex items-center justify-center gap-2 shadow-sm ${
              isPremium
                ? "bg-[#FF4D5E] !text-white cursor-default opacity-100"
                : "bg-white text-[#0B1221] hover:bg-gray-100"
            }`}
          >
            {isPremium ? (
              <>
                <Check className="w-4 h-4 shrink-0" style={{ color: "#ffffff" }} />
                <span style={{ color: "#ffffff" }}>Current Plan</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FF4D5E]" /> Connecting Stripe...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-[#FF4D5E]" /> Subscribe with Stripe
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Plan;
