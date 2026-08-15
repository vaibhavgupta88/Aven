import { useState } from "react";
import { Eraser, Sparkles, Download, Lock, Unlock, Crown, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import { saveLocalCreation } from "../lib/creationsStorage";

const RemoveBackground = () => {
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
      formData.append("image", input);

      let token = "";
      try {
        token = await getToken();
      } catch (tokenErr) {
        console.warn("Token fetch note:", tokenErr);
      }

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (user?.id) headers["x-user-id"] = user.id;

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        { headers }
      );

      if (data.success) {
        setContent(data.content);
        const newCreation = {
          id: `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: user?.id || "guest",
          prompt: "Remove background from image",
          content: data.content,
          type: "image",
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

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `aven-ai-bg-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      window.open(content, "_blank");
    }
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
            <h1 className="text-lg sm:text-xl font-bold text-white">Background Removal</h1>
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
              Upgrade to the Premium Plan to unlock unlimited AI Background Removal, Object Removal, and ATS Resume Reviews.
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

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FF4D5E]/20 file:text-[#FF4D5E] transition"
          required
        />
        <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, and WebP image formats</p>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white px-4 py-3 mt-8 text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : isPremium ? (
            <Eraser className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {isPremium ? "Remove Background" : "Unlock with Pro ($19/mo)"}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Eraser className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <Eraser className="w-8 h-8 text-gray-600" />
              <p>Upload an image and click "Remove Background" to preview</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 flex flex-col items-center justify-between gap-4">
            <img
              src={content}
              alt="Processed background removed image"
              className="w-full rounded-xl border border-white/10 shadow-md max-h-[450px] object-contain bg-black/20"
            />

            <button
              onClick={handleDownloadImage}
              className="w-full flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-4 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF4D5E]" /> Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;
