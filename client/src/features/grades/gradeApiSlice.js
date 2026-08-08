import { apiSlice } from "../api/apiSlice";

export const gradeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    assignGrade: builder.mutation({
      query: (body) => ({ url: "/grades", method: "POST", data: body }),
      invalidatesTags: (result, error, body) => [
        { type: "Grade", id: body.course },
        { type: "Grade", id: "TRANSCRIPT" },
      ],
    }),
    getCourseGrades: builder.query({
      query: (courseId) => ({ url: `/grades/course/${courseId}`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Grade", id: courseId }],
    }),
    getMyTranscript: builder.query({
      query: () => ({ url: "/grades/transcript", method: "GET" }),
      providesTags: [{ type: "Grade", id: "TRANSCRIPT" }],
    }),
    getStudentTranscript: builder.query({
      query: (studentId) => ({ url: `/grades/transcript/${studentId}`, method: "GET" }),
      providesTags: (result, error, studentId) => [{ type: "Grade", id: studentId }],
    }),
  }),
});

export const {
  useAssignGradeMutation,
  useGetCourseGradesQuery,
  useGetMyTranscriptQuery,
  useGetStudentTranscriptQuery,
} = gradeApiSlice;
