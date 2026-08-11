import { apiSlice } from "../api/apiSlice";

export const cmsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAnnouncements: builder.query({
      query: () => ({ url: "/cms/announcements", method: "GET" }),
      providesTags: [{ type: "Announcement", id: "LIST" }],
    }),
    createAnnouncement: builder.mutation({
      query: (body) => ({ url: "/cms/announcements", method: "POST", data: body }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cms/announcements/${id}`, method: "PATCH", data: body }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({ url: `/cms/announcements/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),
    getPublicSections: builder.query({
      query: () => ({ url: "/cms/sections/public", method: "GET" }),
      providesTags: [{ type: "Section", id: "LIST" }],
    }),
    upsertSection: builder.mutation({
      query: ({ key, ...body }) => ({ url: `/cms/sections/${key}`, method: "PUT", data: body }),
      invalidatesTags: [{ type: "Section", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetPublicSectionsQuery,
  useUpsertSectionMutation,
} = cmsApiSlice;
