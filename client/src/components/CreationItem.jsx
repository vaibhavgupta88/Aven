import { useState } from "react";
import Markdown from "react-markdown";
import { ChevronDown, ChevronUp, Download, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { getToken } = useAuth();

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      if (item.type === "image") {
        const response = await fetch(item.content);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `aven-ai-${item.prompt.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded successfully!");
      } else {
        const blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `aven-ai-${item.prompt.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Creation downloaded successfully!");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this creation?")) return;

    try {
      setDeleting(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/delete-creation",
        { id: item.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Creation deleted!");
        if (onDelete) onDelete(item.id);
      } else {
        toast.error(data.message || "Failed to delete creation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete creation");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="font-semibold text-white text-base">{item.prompt}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="capitalize text-xs font-semibold text-[#FF4D5E]">
            {item.type}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 text-gray-300">
          {item.type === "image" ? (
            <div>
              <img
                src={item.content}
                alt="creation"
                className="mt-2 w-full max-w-md rounded-lg border border-white/10"
              />
            </div>
          ) : (
            <div className="mt-2 text-sm leading-relaxed text-gray-300">
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}

          {/* Action Toolbar: Download & Delete */}
          <div className="mt-4 pt-3 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-200 border border-white/10 transition cursor-pointer"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF4D5E]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#FF4D5E]" />
              )}
              Download
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 border border-red-500/20 transition cursor-pointer"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreationItem;
