import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { ArrowRight, Wand2, Image as ImageIcon, FileText, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Spotlight } from "./ui/spotlight";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToTools = (e) => {
    e.preventDefault();
    const toolsSection = document.getElementById("tools");
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-screen pt-44 pb-24 px-4 sm:px-8 xl:px-12 flex flex-col items-center justify-center overflow-hidden bg-[#09090B] tracking-[-0.02em]">
      {/* Circular Flowing Red Spotlight Orb Spanning Hero Section */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <Spotlight
          className="top-10 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] animate-circle-spotlight"
          fill="#FF4D5E"
        />
      </div>

      {/* Hero Headline with Soft Fade-In Animation */}
      <div className="text-center max-w-4xl mx-auto z-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.03em] text-white text-center leading-[1.12] animate-fade-in-soft">
          Craft your AI with feeling<span className="text-[#FF4D5E]">.</span>
        </h1>

        <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto text-center font-medium leading-relaxed mt-6 tracking-[-0.02em] animate-fade-in-delay-1">
          Polished <span className="text-[#FF4D5E] font-semibold">primitives</span> and{" "}
          <span className="text-[#FF4D5E] font-semibold">tools</span> for AI content creation, shaped with thoughtful motion.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-semibold mt-10 animate-fade-in-delay-2">
          <button
            onClick={() => navigate("/ai")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#0B1221] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-semibold transition cursor-pointer shadow-sm tracking-[-0.02em]"
          >
            <Wand2 className="w-4 h-4 text-[#FF4D5E]" /> Start Creating Free <ArrowRight className="w-4 h-4 text-[#FF4D5E]" />
          </button>

          <a
            href="#tools"
            onClick={scrollToTools}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-8 py-3.5 rounded-xl backdrop-blur-md transition-all cursor-pointer font-medium tracking-[-0.02em]"
          >
            Browse Primitives
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-gray-400 font-medium tracking-[-0.02em] animate-fade-in-delay-2">
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
            <Zap className="w-3.5 h-3.5 text-[#FF4D5E]" /> Ultra-Fast Generation
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF4D5E]" /> No Credit Card Required
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D5E]" /> Powered by Gemini & Cloudinary
          </div>
        </div>
      </div>

      {/* Floating Studio Preview Card */}
      <div className="mt-20 w-full max-w-5xl z-10 animate-float-smooth">
        <div className="relative rounded-3xl p-2 bg-gradient-to-b from-white/15 via-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
          <div className="bg-[#0F1423] rounded-2xl p-5 sm:p-8 overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="ml-3 text-xs font-mono text-gray-400">aven.ai/studio</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#FF4D5E] bg-[#FF4D5E]/10 px-3 py-1 rounded-full border border-[#FF4D5E]/20">
                <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-ping"></span> Live Studio Preview
              </div>
            </div>

            {/* Mock Workspace Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between unlumen-hover-card">
                <div>
                  <div className="mb-4 text-[#FF4D5E]">
                    <FileText className="w-6 h-6 text-[#FF4D5E]" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Article Writer</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-medium">Generating SEO long-form articles with structured headers...</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#FF4D5E] font-medium">
                  <span>Gemini Flash</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between unlumen-hover-card">
                <div>
                  <div className="mb-4 text-[#FF4D5E]">
                    <ImageIcon className="w-6 h-6 text-[#FF4D5E]" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Visual Art Studio</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-medium">Rendering 4K photorealistic digital art & style transfer...</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#FF4D5E] font-medium">
                  <span>Clipdrop AI</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready
                  </span>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between unlumen-hover-card">
                <div>
                  <div className="mb-4 text-[#FF4D5E]">
                    <Wand2 className="w-6 h-6 text-[#FF4D5E]" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Generative Eraser</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-medium">Generative AI object and background removal in real time...</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#FF4D5E] font-medium">
                  <span>Cloudinary AI</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Instant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Logos Marquee */}
      <div className="w-full max-w-5xl mt-24 z-10">
        <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-10">
          Trusted by digital creators & teams worldwide
        </p>
        <div className="overflow-hidden w-full opacity-80">
          <div className="flex gap-16 animate-marquee whitespace-nowrap items-center">
            <img src={assets.facebook} alt="Facebook" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.slack} alt="Slack" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.framer} alt="Framer" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.netflix} alt="Netflix" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.google} alt="Google" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.linkedin} alt="LinkedIn" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />

            <img src={assets.facebook} alt="Facebook" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.slack} alt="Slack" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.framer} alt="Framer" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.netflix} alt="Netflix" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.google} alt="Google" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
            <img src={assets.linkedin} alt="LinkedIn" className="h-6 brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 inline-block" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
