import { useState } from "react";
import { Hash, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth, useUser } from "@clerk/clerk-react";
import { saveLocalCreation } from "../lib/creationsStorage";

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();
  const { user } = useUser();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = input.trim();

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
        "/api/ai/generate-blog-title",
        { prompt, category: selectedCategory },
        { headers }
      );

      if (data.success) {
        setContent(data.content);
        const newCreation = {
          id: `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: user?.id || "guest",
          prompt: `Blog titles for ${prompt}`,
          content: data.content,
          type: "blog-title",
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

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 flex items-start flex-wrap lg:flex-nowrap gap-6 text-gray-200 tracking-[-0.02em]">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#FF4D5E] shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-white">AI Title Generator</h1>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Keyword / Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FF4D5E] transition"
          placeholder="e.g., The future of artificial intelligence..."
          required
        />

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Category</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-3.5 py-1.5 border rounded-xl cursor-pointer transition ${
                selectedCategory === item
                  ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/50 font-semibold"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white px-4 py-3 mt-8 text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-4 h-4" />
          )}
          Generate Titles
        </button>
      </form>

      {/* Right col */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Hash className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <Hash className="w-8 h-8 text-gray-600" />
              <p>Enter a topic and click "Generate Titles" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-scroll text-sm leading-relaxed text-gray-300">
            <div className="reset-tw">
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
