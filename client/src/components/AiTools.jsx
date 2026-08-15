import { useNavigate } from "react-router-dom";
import { AiToolsData } from "../assets/assets";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";

const AiTools = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const handleToolClick = (path) => {
    if (user) {
      navigate(path);
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
            onClick={() => handleToolClick(tool.path)}
            className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-7 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="mb-5 text-[#FF4D5E]">
                <tool.Icon className="w-6 h-6 text-[#FF4D5E]" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#FF4D5E] transition">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed font-medium">
                {tool.description}
              </p>
            </div>

            <div className="mt-8 flex items-center text-xs font-semibold text-gray-400 group-hover:text-white transition">
              <span>Launch Primitive</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1 text-[#FF4D5E]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AiTools;
