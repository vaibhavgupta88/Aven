import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { CheckCircle, ArrowRight, Wand2, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const isDemo = searchParams.get("demo");

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const confirmStripePayment = async () => {
      try {
        setVerifying(true);
        let token = "";
        try {
          token = await getToken();
        } catch (tErr) {
          console.warn("Token fetch note:", tErr);
        }

        const { data } = await axios.get(
          `/api/stripe/verify-payment?sessionId=${sessionId || ""}&demo=${isDemo || ""}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (data.success) {
          setVerified(true);
          if (user) {
            await user.reload();
          }
          toast.success("Payment verified! Welcome to Aven AI Premium.", {
            id: "payment-toast",
            duration: 5000,
          });
        } else {
          setVerified(false);
          toast.error(data.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    confirmStripePayment();
  }, [sessionId, isDemo, user, getToken]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6 text-center text-white tracking-[-0.02em] relative overflow-hidden">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10 animate-fade-in-soft">
        {verifying ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#FF4D5E] animate-spin" />
            <h2 className="text-xl font-bold text-white">Verifying Payment...</h2>
            <p className="text-sm text-gray-400">Please wait while we confirm your Stripe checkout.</p>
          </div>
        ) : verified ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-bold text-white tracking-[-0.03em]">
              Payment Confirmed!
            </h1>

            <p className="text-gray-400 text-sm mt-3 leading-relaxed font-medium">
              Thank you for subscribing to <span className="text-white font-semibold">Aven AI Premium</span>. Your account has been verified and upgraded with unlimited access.
            </p>

            {(sessionId || isDemo) && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-400 truncate">
                Ref ID: {sessionId || "DEMO_STRIPE_PAYMENT_OK"}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => navigate("/ai")}
                className="w-full py-3.5 px-6 rounded-xl bg-white text-[#0B1221] hover:bg-gray-100 font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4 text-[#FF4D5E]" /> Launch Studio Dashboard <ArrowRight className="w-4 h-4 text-[#FF4D5E]" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-medium transition cursor-pointer text-sm"
              >
                Back to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-bold text-white tracking-[-0.03em]">
              Payment Pending / Unconfirmed
            </h1>

            <p className="text-gray-400 text-sm mt-3 leading-relaxed font-medium">
              We could not verify a completed Stripe payment for this session. Your plan has not been upgraded.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => navigate("/#pricing")}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                Return to Pricing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
