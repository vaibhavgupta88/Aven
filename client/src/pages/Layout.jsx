import { Outlet, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

const Layout = () => {
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();
  const { theme } = useTheme();

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen bg-[#09090B] text-gray-200">
      {/* Top Navbar */}
      <nav className="w-full px-6 sm:px-8 h-16 flex items-center justify-between border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md z-20">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={theme === "light" ? assets.logo_light : assets.logo}
            alt="Aven Logo"
            className="cursor-pointer h-8 object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        </Link>
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer sm:hidden"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer sm:hidden"
          />
        )}
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 w-full flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 bg-[#09090B] overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-[#09090B]">
      <SignIn />
    </div>
  );
};

export default Layout;
