import { useNavigate } from "react-router-dom";
import { AiToolsData } from "../assets/assets";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ArrowRight, Lock, Crown } from "lucide-react";

const AiTools = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const isPremium =
    user?.publicMetadata?.plan === "premium" ||
    user?.privateMetadata?.plan === "premium";

  const handleToolClick = (tool) => {
    if (tool.isPro && !isPremium) {
      navigate("/pricing");
      return;
    }
    if (user) {
      navigate(tool.path);
    } else {
      openSignIn();
    }
  };

  return (
    <section id="tools" className="px-6 md:px-12 xl:px-24 py-24 relative bg-[#09090B] tracking-[-0.02em]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-6xl font-semibold text-white tracking-[-0.03em] leading-tight">
          Polished AI primitives<span className="text-[#FF4D5E]">.</span>
        </h2>
        <p className="text-gray-400 mt-4 text-base sm:text-lg max-w-xl mx-auto font-medium">
          Built for creators, engineers, and marketers who demand production-grade quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            onClick={() => handleToolClick(tool)}
            className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-7 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-[#FF4D5E]">
                  <tool.Icon className="w-6 h-6 text-[#FF4D5E]" />
                </div>
                {tool.isPro && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 shadow-sm flex items-center gap-1">
                      <Crown className="w-3 h-3 text-[#FF4D5E]" /> PRO
                    </span>
                    {!isPremium && (
                      <span className="p-1 rounded-md bg-white/5 border border-white/10 text-gray-400 group-hover:text-white transition">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#FF4D5E] transition">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed font-medium">
                {tool.description}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between text-xs font-semibold text-gray-400 group-hover:text-white transition">
              <span className="flex items-center gap-1.5">
                {tool.isPro && !isPremium ? "Unlock with Pro" : "Launch Primitive"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1 text-[#FF4D5E]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AiTools;
