import { apiSlice } from "../api/apiSlice";

export const courseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: (params) => ({ url: "/courses", method: "GET", params }),
      providesTags: (result) =>
        result?.data?.courses
          ? [
              ...result.data.courses.map(({ _id }) => ({ type: "Course", id: _id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),
    getCourseById: builder.query({
      query: (id) => ({ url: `/courses/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    createCourse: builder.mutation({
      query: (body) => ({ url: "/courses", method: "POST", data: body }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/courses/${id}`, method: "PATCH", data: body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
    assignCourseTeachers: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/courses/${id}/teachers`, method: "PUT", data: body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }, { type: "Course", id: "LIST" }],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({ url: `/courses/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),
    enrollInCourse: builder.mutation({
      query: (id) => ({ url: `/courses/${id}/enroll`, method: "POST" }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
    dropCourse: builder.mutation({
      query: (id) => ({ url: `/courses/${id}/drop`, method: "POST" }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
    addMaterial: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/courses/${id}/materials`, method: "POST", data: body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),
    removeMaterial: builder.mutation({
      query: ({ id, materialId }) => ({
        url: `/courses/${id}/materials/${materialId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useAssignCourseTeachersMutation,
  useDeleteCourseMutation,
  useEnrollInCourseMutation,
  useDropCourseMutation,
  useAddMaterialMutation,
  useRemoveMaterialMutation,
} = courseApiSlice;
