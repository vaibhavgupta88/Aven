import { useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  Hash,
  House,
  Image,
  Scissors,
  SquarePen,
  FileText,
  Users,
  LogOut,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, toggleTheme } = useTheme();

  const isPremium =
    user?.publicMetadata?.plan === "premium" ||
    user?.privateMetadata?.plan === "premium";

  return (
    <aside
      className={`w-64 bg-[#09090B] border-r border-white/10 flex flex-col justify-between items-center max-sm:absolute top-16 bottom-0 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out z-30`}
    >
      <div className="my-6 w-full px-4">
        {/* User Card with Plan Status Badge */}
        <div className="flex items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl mb-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.imageUrl}
              alt="User avatar"
              className="w-9 h-9 rounded-full border border-white/10 shrink-0"
            />
            <div className="overflow-hidden flex flex-col justify-center gap-1.5">
              <h2 className="text-xs font-semibold text-white truncate leading-tight">{user?.fullName}</h2>
              <p className={`text-[10px] font-semibold flex items-center gap-1 leading-tight ${isPremium ? "text-[#FF4D5E]" : "text-emerald-400"}`}>
                <Zap className="w-2.5 h-2.5 shrink-0" />
                {isPremium ? "Pro Creator" : "Free Starter"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition cursor-pointer shrink-0 group"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="space-y-1 text-sm font-medium">
          {navItems.map((item) => {
            const ItemIcon = item.Icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/ai"}
                onClick={() => setSidebar(false)}
                className={({ isActive }) =>
                  `px-3.5 py-2.5 flex items-center gap-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ItemIcon className={`w-4 h-4 ${isActive ? "text-black" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer User Profile & Signout */}
      <div className="w-full border-t border-white/10 p-4 px-6 flex items-center justify-between bg-white/[0.02]">
        <div
          onClick={openUserProfile}
          className="flex gap-2.5 items-center cursor-pointer hover:opacity-80 transition"
        >
          <img
            src={user?.imageUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-white/10"
          />
          <div>
            <h3 className="text-xs font-semibold text-white truncate max-w-[100px]">{user?.fullName}</h3>
            <span className="text-[10px] text-gray-400">Settings</span>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-4 h-4 text-gray-400 hover:text-red-400 transition cursor-pointer"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
