import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosInstance } from "../../lib/axios";

// Custom axios-based baseQuery so RTK Query reuses our interceptor logic (refresh, auth header).
const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User", "Department", "Course", "Attendance", "Assignment", "Grade"],
  endpoints: () => ({}),
});
