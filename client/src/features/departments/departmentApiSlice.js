import { apiSlice } from "../api/apiSlice";

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => ({ url: "/departments", method: "GET" }),
      providesTags: ["Department"],
    }),
    createDepartment: builder.mutation({
      query: (body) => ({ url: "/departments", method: "POST", data: body }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/departments/${id}`, method: "PATCH", data: body }),
      invalidatesTags: ["Department"],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApiSlice;
