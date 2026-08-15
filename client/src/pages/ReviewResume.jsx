import { useState } from "react";
import { FileText, Sparkles, Lock, Unlock, Crown, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth, useUser } from "@clerk/clerk-react";
import { saveLocalCreation } from "../lib/creationsStorage";

const ReviewResume = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const isPremium =
    user?.publicMetadata?.plan === "premium" ||
    user?.privateMetadata?.plan === "premium";

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!isPremium) {
      toast.error("Upgrade to the Premium Plan to unlock this Pro feature!", { id: "pro-lock" });
      navigate("/pricing");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", input);

      let token = "";
      try {
        token = await getToken();
      } catch (tokenErr) {
        console.warn("Token fetch note:", tokenErr);
      }

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (user?.id) headers["x-user-id"] = user.id;

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers,
      });

      if (data.success) {
        setContent(data.content);
        const newCreation = {
          id: `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: user?.id || "guest",
          prompt: "Review the uploaded resume",
          content: data.content,
          type: "resume-review",
          created_at: new Date().toISOString(),
        };
        saveLocalCreation(user?.id, newCreation);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 flex items-start flex-wrap lg:flex-nowrap gap-6 text-gray-200 tracking-[-0.02em]">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#FF4D5E] shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white">ATS Resume Reviewer</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#FF4D5E]" /> PRO
            </span>
            {isPremium ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Unlock className="w-3 h-3" /> Unlocked
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Pro Lock Upgrade Banner if not premium */}
        {!isPremium && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#FF4D5E]/15 to-transparent border border-[#FF4D5E]/30 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#FF4D5E]" />
                <span className="text-xs font-bold text-white">Exclusive Premium Feature</span>
              </div>
              <span className="text-xs font-bold text-[#FF4D5E]">$19/mo</span>
            </div>
            <p className="text-xs text-gray-300">
              Upgrade to the Premium Plan to get deep ATS feedback, formatting checks, and career impact scoring on your PDF resume.
            </p>
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="mt-1 w-full py-2 px-3 rounded-lg bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Upgrade to Unlock Pro</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Upload PDF Resume</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="application/pdf"
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FF4D5E]/20 file:text-[#FF4D5E] transition"
          required
        />
        <p className="text-xs text-gray-500 mt-2">Supports PDF resumes up to 5MB</p>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white px-4 py-3 mt-8 text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : isPremium ? (
            <FileText className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {isPremium ? "Review Resume" : "Unlock with Pro ($19/mo)"}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96 lg:max-h-[650px]">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <FileText className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">ATS Feedback & Score</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <FileText className="w-8 h-8 text-gray-600" />
              <p>Upload your PDF resume and click "Review Resume" to get feedback</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-scroll text-sm leading-relaxed text-gray-300 pr-2">
            <div className="reset-tw">
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;
