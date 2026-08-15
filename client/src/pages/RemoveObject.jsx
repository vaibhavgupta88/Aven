import { useState } from "react";
import { Scissors, Sparkles, Download } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null);
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
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
      link.download = `aven-ai-object-erased-${Date.now()}.png`;
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
          <h1 className="text-lg sm:text-xl font-bold text-white">Object Eraser</h1>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FF4D5E]/20 file:text-[#FF4D5E] transition"
          required
        />

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Describe Object to Remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={2}
          className="w-full p-3 mt-2 outline-none text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FF4D5E] transition"
          placeholder="e.g., person standing in background, car, power line..."
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#FF4D5E] hover:bg-[#FF4D5E]/90 text-white px-4 py-3 mt-8 text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Scissors className="w-4 h-4" />
          )}
          Erase Object
        </button>
      </form>

      {/* Right col */}
      <div className="w-full lg:flex-1 p-4 sm:p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-lg min-h-80 lg:min-h-96">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Scissors className="w-5 h-5 text-[#FF4D5E]" />
          <h1 className="text-xl font-bold text-white">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-500 text-center">
              <Scissors className="w-8 h-8 text-gray-600" />
              <p>Upload an image and specify object to erase</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 flex flex-col items-center justify-between gap-4">
            <img
              src={content}
              alt="Processed object removed image"
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

export default RemoveObject;
