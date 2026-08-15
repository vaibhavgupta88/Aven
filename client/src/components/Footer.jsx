import { assets } from "../assets/assets";
import { Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#09090B] border-t border-white/10 px-6 md:px-16 lg:px-24 xl:px-32 pt-16 pb-8 w-full !text-white tracking-[-0.02em]">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-white/10 pb-12">
        <div className="md:max-w-96">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-block cursor-pointer group"
          >
            <img
              className="h-8 object-contain mb-4 transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              src={assets.logo}
              alt="Aven logo"
            />
          </Link>
          <p className="text-sm !text-white leading-relaxed font-medium">
            Craft your AI content with feeling. Production-ready primitives and tools shaped with thoughtful motion.
          </p>
        </div>

        <div className="flex-1 flex flex-wrap items-start md:justify-end gap-12 sm:gap-20">
          <div>
            <h4 className="font-semibold mb-4 !text-white text-sm">Navigation</h4>
            <ul className="text-sm space-y-2.5 font-medium !text-white">
              <li>
                <a href="#tools" className="hover:opacity-80 transition !text-white">Primitives</a>
              </li>
              <li>
                <a href="#pricing" className="hover:opacity-80 transition !text-white">Pricing</a>
              </li>
              <li>
                <Link to="/ai/community" className="hover:opacity-80 transition !text-white">Community</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold !text-white mb-4 text-sm">Community</h4>
            <div className="flex items-center gap-3 !text-white">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/10 border border-white/10 !text-white hover:opacity-80 transition"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 !text-white" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/10 border border-white/10 !text-white hover:opacity-80 transition"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 !text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="pt-6 text-center text-xs !text-white font-medium">
        Copyright 2026 © Aven. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
