import { useNavigate, Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { ArrowRight, Github, Twitter, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto">
      <div className="w-full max-w-5xl rounded-full bg-[#09090B]/60 backdrop-blur-2xl border border-white/15 px-6 py-3 flex items-center justify-between shadow-2xl transition-all duration-300">
        {/* Left Side: Brand Logo + Nav Links */}
        <div className="flex items-center gap-8 md:gap-12">
          {/* Brand Logo with 1.2s Smooth Slow Hover Animation */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-xl font-bold tracking-[-0.03em] text-white transition-transform duration-[1200ms] ease-out group-hover:scale-105 inline-block">
              Aven<span className="text-[#FF4D5E]">.</span>
            </span>
          </Link>

          {/* Navigation Links Shifted Left */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a
              href="#tools"
              className="hover:text-white transition-colors duration-200"
            >
              Primitives
            </a>
            <a
              href="#pricing"
              className="hover:text-white transition-colors duration-200"
            >
              Pricing
            </a>
            <Link
              to="/ai/community"
              className="hover:text-white transition-colors duration-200"
            >
              Community
            </Link>
          </nav>
        </div>

        {/* Right Side: Action Controls & User Account */}
        <div className="flex items-center gap-4">
          {/* Social Icons */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>

          {/* Theme Toggle Button: Grey default, Moon -> Purple, Sun -> Yellow */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1 cursor-pointer group"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            )}
          </button>

          {/* Auth Action Pill Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/ai")}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
              >
                Dashboard
              </button>
              <UserButton />
            </div>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 bg-white text-[#0B1221] hover:bg-gray-100 px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer shadow-sm tracking-[-0.02em]"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5 text-[#FF4D5E]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
