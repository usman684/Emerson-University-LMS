import { apiSlice } from "../api/apiSlice";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: () => ({ url: "/analytics/overview", method: "GET" }),
    }),
    getStudentsPerDepartment: builder.query({
      query: () => ({ url: "/analytics/students-per-department", method: "GET" }),
    }),
    getFeeCollectionTrend: builder.query({
      query: () => ({ url: "/analytics/fee-collection-trend", method: "GET" }),
    }),
    getGradeDistribution: builder.query({
      query: () => ({ url: "/analytics/grade-distribution", method: "GET" }),
    }),
    getAttendanceOverview: builder.query({
      query: () => ({ url: "/analytics/attendance-overview", method: "GET" }),
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetStudentsPerDepartmentQuery,
  useGetFeeCollectionTrendQuery,
  useGetGradeDistributionQuery,
  useGetAttendanceOverviewQuery,
} = analyticsApiSlice;
