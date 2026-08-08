import { apiSlice } from "../api/apiSlice";

export const attendanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    markAttendance: builder.mutation({
      query: (body) => ({ url: "/attendance", method: "POST", data: body }),
      invalidatesTags: (result, error, body) => [
        { type: "Attendance", id: body.course },
      ],
    }),
    getCourseAttendance: builder.query({
      query: (courseId) => ({ url: `/attendance/course/${courseId}`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Attendance", id: courseId }],
    }),
    getCourseAttendanceSummary: builder.query({
      query: (courseId) => ({ url: `/attendance/course/${courseId}/summary`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Attendance", id: courseId }],
    }),
    getMyAttendance: builder.query({
      query: (courseId) => ({ url: "/attendance/me", method: "GET", params: { course: courseId } }),
      providesTags: (result, error, courseId) => [{ type: "Attendance", id: courseId }],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetCourseAttendanceQuery,
  useGetCourseAttendanceSummaryQuery,
  useGetMyAttendanceQuery,
} = attendanceApiSlice;
