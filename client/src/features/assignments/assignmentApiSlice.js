import { apiSlice } from "../api/apiSlice";

export const assignmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation({
      query: (body) => ({ url: "/assignments", method: "POST", data: body }),
      invalidatesTags: (result, error, body) => [{ type: "Assignment", id: body.course }],
    }),
    getCourseAssignments: builder.query({
      query: (courseId) => ({ url: `/assignments/course/${courseId}`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Assignment", id: courseId }],
    }),
    getAssignmentById: builder.query({
      query: (id) => ({ url: `/assignments/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),
    updateAssignment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/assignments/${id}`, method: "PATCH", data: body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }],
    }),
    deleteAssignment: builder.mutation({
      query: (id) => ({ url: `/assignments/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),
    submitAssignment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/assignments/${id}/submit`, method: "POST", data: body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }],
    }),
    gradeSubmission: builder.mutation({
      query: ({ id, studentId, ...body }) => ({
        url: `/assignments/${id}/grade/${studentId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useGetCourseAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
} = assignmentApiSlice;
