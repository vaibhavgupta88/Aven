import { useCallback, useEffect, useState } from "react";
import { Gem, Sparkles, FolderKanban } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import {
  getLocalCreations,
  setLocalCreations,
  removeLocalCreation,
} from "../lib/creationsStorage";
import axios from "axios";

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const userId = user?.id || (isLoaded ? "guest" : "");

  const isPremium =
    user?.publicMetadata?.plan === "premium" ||
    user?.privateMetadata?.plan === "premium";

  const getDashboardData = useCallback(async () => {
    if (!isLoaded) return;

    let serverItems = [];
    try {
      let token = "";
      try {
        token = await getToken();
      } catch (tErr) {
        console.warn("Token fetch note:", tErr);
      }

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (user?.id) headers["x-user-id"] = user.id;

      const { data } = await axios.get("/api/user/get-user-creations", {
        headers,
      });

      if (data.success && Array.isArray(data.creations)) {
        serverItems = data.creations;
      }
    } catch (error) {
      console.warn("Dashboard fetch note:", error.message);
    }

    // Read stored creations scoped to the current user (with auto-claim for guest items)
    const localItems = getLocalCreations(userId || "guest");

    // Combine server + local items deduplicated by id
    const combinedMap = new Map();
    [...serverItems, ...localItems].forEach((item) => {
      if (item && item.id) {
        combinedMap.set(item.id, item);
      }
    });

    const finalCreations = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    setCreations(finalCreations);
    if (userId) {
      setLocalCreations(userId, finalCreations);
    }
    setLoading(false);
  }, [getToken, userId, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded) {
      setLoading(true);
      getDashboardData();
    }
  }, [getDashboardData, isLoaded]);

  const handleDelete = (id) => {
    setCreations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      removeLocalCreation(userId, id);
      return updated;
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 text-gray-200 tracking-[-0.02em]">
      <div className="flex justify-start gap-4 sm:gap-6 flex-wrap">
        {/* Total Creations Card */}
        <div className="flex justify-between items-center w-full sm:w-72 p-5 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-medium text-gray-400">Total Creations</p>
            <h2 className="text-2xl font-bold text-white mt-1">{creations.length}</h2>
          </div>

          <Sparkles className="w-7 h-7 text-[#FF4D5E] shrink-0" />
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-full sm:w-72 p-5 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-medium text-gray-400">Active Plan</p>
            <h2 className="text-2xl font-bold text-white mt-1">
              {isPremium ? "Pro Creator" : "Starter Plan"}
            </h2>
          </div>

          <Gem className="w-7 h-7 text-[#FF4D5E] shrink-0" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#FF4D5E] border-t-transparent"></div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
            <FolderKanban className="w-5 h-5 text-[#FF4D5E]" /> Recent Creations
          </div>
          {creations.length === 0 ? (
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl text-center text-gray-400">
              No creations generated yet. Launch a tool from the sidebar to get started!
            </div>
          ) : (
            creations.map((item) => (
              <CreationItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
