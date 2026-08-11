import { useState } from "react";
import { toast } from "sonner";
import { FileText, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  useGetCourseByIdQuery,
  useAddMaterialMutation,
  useRemoveMaterialMutation,
} from "../../features/courses/courseApiSlice";
import FileUpload from "../ui/FileUpload";
import Button from "../ui/Button";

const CourseMaterials = ({ courseId, canManage }) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

  const { data, isLoading } = useGetCourseByIdQuery(courseId, { skip: !expanded });
  const [addMaterial, { isLoading: adding }] = useAddMaterialMutation();
  const [removeMaterial] = useRemoveMaterialMutation();

  const materials = data?.data?.course?.materials || [];

  const handleAdd = async () => {
    if (!title || !fileUrl) {
      toast.error("Add a title and upload a file first");
      return;
    }
    try {
      await addMaterial({ id: courseId, title, fileUrl, fileType }).unwrap();
      toast.success("Material added");
      setTitle("");
      setFileUrl("");
      setFileType("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add material");
    }
  };

  const handleRemove = async (materialId) => {
    try {
      await removeMaterial({ id: courseId, materialId }).unwrap();
      toast.success("Material removed");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove");
    }
  };

  return (
    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        Course Materials
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          {isLoading ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : materials.length === 0 ? (
            <p className="text-xs text-slate-400">No materials uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {materials.map((m) => (
                <div key={m._id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-slate-800">
                  <a href={m.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 truncate text-brand-600 hover:underline dark:text-brand-400">
                    <FileText size={12} />
                    {m.title}
                  </a>
                  {canManage && (
                    <button onClick={() => handleRemove(m._id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canManage && (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-200 p-2.5 dark:border-slate-700">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Material title (e.g. Week 3 Slides)"
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <FileUpload
                folder="materials"
                value={fileUrl}
                onUploaded={(url, name, type) => {
                  setFileUrl(url);
                  if (name && !title) setTitle(name);
                }}
              />
              <Button size="sm" onClick={handleAdd} isLoading={adding} className="self-start">
                Add Material
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
