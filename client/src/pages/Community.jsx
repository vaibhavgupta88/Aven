import { useAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { Heart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const fetchCreations = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();
      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  }, [getToken]);

  const imageLikeToggle = async (id) => {
    if (!user) {
      toast.error("Please sign in to like creations!");
      return;
    }

    try {
      // Optimistic UI state update
      setCreations((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const currentLikes = Array.isArray(item.likes) ? item.likes : [];
            const isLiked = currentLikes.includes(user.id);
            const newLikes = isLiked
              ? currentLikes.filter((u) => u !== user.id)
              : [...currentLikes, user.id];
            return { ...item, likes: newLikes };
          }
          return item;
        })
      );

      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
        await fetchCreations();
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error(error.message);
      await fetchCreations();
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user, fetchCreations]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="w-10 h-10 my-1 rounded-full border-3 border-[#FF4D5E] border-t-transparent animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-4 sm:p-6 text-gray-200 tracking-[-0.02em]">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-[#FF4D5E]" />
        <h1 className="text-lg sm:text-xl font-bold text-white">Community Gallery</h1>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl h-full w-full rounded-2xl p-4 sm:p-6 overflow-y-auto border border-white/10">
        {creations.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center p-6">
            <div className="w-16 h-16 bg-[#FF4D5E]/10 text-[#FF4D5E] border border-[#FF4D5E]/20 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Community Creations Yet</h2>
            <p className="text-gray-400 max-w-md mt-2 text-sm">
              Be the first to share! Create an image and check <strong>"Publish generated image to public community gallery"</strong> to showcase your artwork here.
            </p>
            <Link
              to="/ai/generate-images"
              className="mt-6 flex items-center gap-2 bg-[#FF4D5E] text-white px-6 py-3 text-sm font-semibold rounded-xl shadow-lg hover:bg-[#FF4D5E]/90 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Generate & Publish Image
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {creations.map((creation, index) => {
              const likesArray = Array.isArray(creation.likes) ? creation.likes : [];
              const isLiked = user?.id ? likesArray.includes(user.id) : false;

              return (
                <div
                  key={creation.id || index}
                  className="relative group inline-block w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] overflow-hidden rounded-xl"
                >
                  <img
                    src={creation.content}
                    alt={creation.prompt}
                    className="w-full h-64 object-cover rounded-xl shadow-sm border border-white/10 transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* High Contrast Hover Overlay */}
                  <div className="absolute inset-0 flex gap-2 items-end justify-between p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl community-card-overlay">
                    <p className="text-sm line-clamp-2 font-medium !text-white drop-shadow-md">
                      {creation.prompt}
                    </p>
                    <div className="flex gap-1.5 items-center bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 ml-auto shrink-0 shadow-lg">
                      <span className="text-xs font-semibold !text-white" style={{ color: "#ffffff" }}>
                        {likesArray.length}
                      </span>
                      <Heart
                        onClick={(e) => {
                          e.stopPropagation();
                          imageLikeToggle(creation.id);
                        }}
                        className={`w-4 h-4 hover:scale-110 transition cursor-pointer ${
                          isLiked ? "fill-[#FF4D5E] text-[#FF4D5E]" : "!text-white"
                        }`}
                        style={!isLiked ? { color: "#ffffff" } : {}}
                      />
                    </div>
                  </div>

                  {/* Always Visible Like Badge when not hovered */}
                  <div className="absolute bottom-3 right-3 flex gap-1.5 items-center bg-black/80 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md group-hover:hidden community-card-overlay">
                    <span className="text-xs font-semibold !text-white" style={{ color: "#ffffff" }}>
                      {likesArray.length}
                    </span>
                    <Heart
                      onClick={(e) => {
                        e.stopPropagation();
                        imageLikeToggle(creation.id);
                      }}
                      className={`w-4 h-4 hover:scale-110 transition cursor-pointer ${
                        isLiked ? "fill-[#FF4D5E] text-[#FF4D5E]" : "!text-white"
                      }`}
                      style={!isLiked ? { color: "#ffffff" } : {}}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
