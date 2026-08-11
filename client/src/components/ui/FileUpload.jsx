import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Paperclip, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

/**
 * Uploads a file to /api/upload and reports the resulting URL via onUploaded.
 * folder groups files in Cloudinary (e.g. "materials", "submissions", "avatars").
 */
const FileUpload = ({ folder = "general", value, onUploaded, accept }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axiosInstance.post(`/upload?folder=${folder}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(data.data.url, data.data.originalName);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
      setFileName("");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setFileName("");
    onUploaded("", "");
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" id={`file-${folder}`} />

      {!value ? (
        <label
          htmlFor={`file-${folder}`}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Choose file"}
        </label>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          <Paperclip size={14} className="text-slate-400" />
          <span className="max-w-[160px] truncate text-slate-700 dark:text-slate-300">
            {fileName || "File attached"}
          </span>
          <button type="button" onClick={handleClear} className="text-slate-400 hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
