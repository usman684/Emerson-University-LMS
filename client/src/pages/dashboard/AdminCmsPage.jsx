import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, X, Trash2, Megaphone, Globe } from "lucide-react";

import {
  useGetAllAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetPublicSectionsQuery,
  useUpsertSectionMutation,
} from "../../features/cms/cmsApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const SITE_SECTIONS = [
  { key: "hero", label: "Homepage Hero" },
  { key: "about", label: "About the University" },
  { key: "contact", label: "Contact Information" },
];

const SectionEditor = ({ sectionKey, label, existing }) => {
  const [upsertSection, { isLoading }] = useUpsertSectionMutation();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      heading: existing?.heading || "",
      body: existing?.body || "",
      imageUrl: existing?.imageUrl || "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      await upsertSection({ key: sectionKey, ...formData }).unwrap();
      toast.success(`${label} updated`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save section");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{label}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Heading" {...register("heading")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Body Text</label>
          <textarea
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            {...register("body")}
          />
        </div>
        <Input label="Image URL (optional)" {...register("imageUrl")} />
        <Button type="submit" size="sm" isLoading={isLoading} className="self-start">
          Save
        </Button>
      </form>
    </Card>
  );
};

const AdminCmsPage = () => {
  const [tab, setTab] = useState("announcements");
  const [showForm, setShowForm] = useState(false);

  const { data: announcementsData, isLoading } = useGetAllAnnouncementsQuery();
  const [createAnnouncement, { isLoading: creating }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const { data: sectionsData } = useGetPublicSectionsQuery();

  const { register, handleSubmit, reset } = useForm({ defaultValues: { isPublished: true } });

  const onSubmit = async (formData) => {
    try {
      await createAnnouncement(formData).unwrap();
      toast.success("Announcement published");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create announcement");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Announcement deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const announcements = announcementsData?.data?.announcements || [];
  const sections = sectionsData?.data?.sections || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Website CMS</h1>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 w-fit">
        {[
          { key: "announcements", label: "Announcements", icon: Megaphone },
          { key: "sections", label: "Site Content", icon: Globe },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "announcements" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm((s) => !s)}>
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "New Announcement"}
            </Button>
          </div>

          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input label="Title" {...register("title", { required: true })} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
                  <textarea
                    rows={4}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    {...register("content", { required: true })}
                  />
                </div>
                <Input label="Cover Image URL (optional)" {...register("coverImageUrl")} />
                <Button type="submit" isLoading={creating} className="self-start">
                  Publish
                </Button>
              </form>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <Card key={a._id} className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                      {!a.isPublished && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{a.content}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(a._id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {tab === "sections" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit the content blocks shown on the public university website homepage.
          </p>
          {SITE_SECTIONS.map((s) => (
            <SectionEditor
              key={s.key}
              sectionKey={s.key}
              label={s.label}
              existing={sections.find((sec) => sec.key === s.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCmsPage;
