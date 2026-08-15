import { Edit, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;

      const { data } = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: selectedLength.length },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 flex items-start flex-wrap lg:flex-nowrap gap-6 text-gray-200 tracking-[-0.02em]">
      {/* Left col - Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#FF4D5E] shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-white">Article Configuration</h1>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FF4D5E] transition"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Article Length</p>
        <div className="mt-3 flex gap-2.5 flex-wrap">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-2 border rounded-xl cursor-pointer transition ${
                selectedLength.text === item.text
                  ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/50 font-semibold"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
              }`}
              key={index}
            >
              {item.text}
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
            <Edit className="w-4 h-4" />
          )}
          Generate Article
        </button>
      </form>

      {/* Right col - Preview */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96 lg:max-h-[650px]">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Edit className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">Generated Article</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <Edit className="w-8 h-8 text-gray-600" />
              <p>Enter a topic and click "Generate Article" to preview</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-scroll text-sm leading-relaxed text-gray-300 pr-2">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
