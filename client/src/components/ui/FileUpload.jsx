import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Paperclip, X, Loader2, CloudUpload } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

const uploadDirectToCloudinary = async (file, folder) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", `emerson-lms/${folder}`);

  const resourceType = file.type.startsWith("image/") ? "image" : "raw";
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Cloudinary upload failed");
  return {
    url: payload.secure_url,
    originalName: file.name,
    fileType: file.type,
    bytes: payload.bytes,
  };
};

/**
 * Uploads to Cloudinary directly when VITE_CLOUDINARY_* is configured.
 * This is the recommended Vercel/serverless path because it does not expose
 * a Cloudinary API key and avoids ephemeral server storage. Falls back to the
 * authenticated backend endpoint for local/signed-upload deployments.
 */
const FileUpload = ({ folder = "general", value, onUploaded, accept }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 15 MB.");
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      let result = await uploadDirectToCloudinary(file, folder);

      if (!result) {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await axiosInstance.post(`/upload?folder=${folder}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        result = data.data;
      }

      onUploaded(result.url, result.originalName || file.name, result.fileType || file.type);
      toast.success("File uploaded successfully");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Upload failed";
      toast.error(message);
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
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`file-${folder}`}
      />
      {!value ? (
        <label
          htmlFor={`file-${folder}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
          {uploading ? "Uploading…" : "Choose file"}
        </label>
      ) : (
        <div className="flex max-w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm dark:bg-slate-800">
          <Paperclip size={14} className="shrink-0 text-slate-400" />
          <span className="max-w-[220px] truncate text-slate-700 dark:text-slate-300">{fileName || "File attached"}</span>
          <button type="button" onClick={handleClear} className="text-slate-400 hover:text-red-500" aria-label="Remove file">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
