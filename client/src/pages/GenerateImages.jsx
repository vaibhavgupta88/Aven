import { useState } from "react";
import { Image as ImageIcon, Sparkles, Download } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const prompt = `Generate an image of ${input} in ${selectedStyle} style`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
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

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `aven-ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      window.open(content, "_blank");
    }
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
          <h1 className="text-lg sm:text-xl font-bold text-white">AI Image Studio</h1>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Describe Your Image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FF4D5E] transition"
          placeholder="Describe what you want to see in the image..."
          required
        />

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Style</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {imageStyle.map((item) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-3.5 py-1.5 border rounded-xl cursor-pointer transition ${
                selectedStyle === item
                  ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/50 font-semibold"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Publish to community checkbox */}
        <div className="mt-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="publish"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="w-4 h-4 accent-[#FF4D5E] cursor-pointer"
          />
          <label htmlFor="publish" className="text-xs text-gray-400 cursor-pointer">
            Publish generated image to public community gallery
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white px-4 py-3 mt-8 text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          Generate Image
        </button>
      </form>

      {/* Right col */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <ImageIcon className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">Generated Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <ImageIcon className="w-8 h-8 text-gray-600" />
              <p>Enter a prompt and click "Generate Image" to preview</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 flex flex-col items-center justify-between gap-4">
            <img
              src={content}
              alt="Generated AI artwork"
              className="w-full rounded-xl border border-white/10 shadow-md max-h-[450px] object-contain bg-black/20"
            />

            <button
              onClick={handleDownloadImage}
              className="w-full flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-4 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF4D5E]" /> Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
