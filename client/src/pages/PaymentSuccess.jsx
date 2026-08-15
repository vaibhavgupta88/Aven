import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { CheckCircle, ArrowRight, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const isDemo = searchParams.get("demo");

  useEffect(() => {
    if (user) {
      user.reload();
    }
    toast.success("Payment Successful! Welcome to Aven AI Premium.", {
      id: "payment-toast",
      duration: 5000,
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6 text-center text-white tracking-[-0.02em] relative overflow-hidden">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10 animate-fade-in-soft">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold text-white tracking-[-0.03em]">
          Payment Successful!
        </h1>

        <p className="text-gray-400 text-sm mt-3 leading-relaxed font-medium">
          Thank you for subscribing to <span className="text-white font-semibold">Aven AI Premium</span>. Your account has been upgraded with unlimited access to all AI primitives and tools.
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
      </div>
    </div>
  );
};

export default PaymentSuccess;
