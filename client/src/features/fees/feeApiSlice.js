import { apiSlice } from "../api/apiSlice";

export const feeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFee: builder.mutation({
      query: (body) => ({ url: "/fees", method: "POST", data: body }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }],
    }),
    createBulkFees: builder.mutation({
      query: (body) => ({ url: "/fees/bulk", method: "POST", data: body }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }],
    }),
    getFees: builder.query({
      query: (params) => ({ url: "/fees", method: "GET", params }),
      providesTags: [{ type: "Fee", id: "LIST" }],
    }),
    getMyFees: builder.query({
      query: () => ({ url: "/fees/me", method: "GET" }),
      providesTags: [{ type: "Fee", id: "MY" }],
    }),
    getFeeSummary: builder.query({
      query: () => ({ url: "/fees/summary", method: "GET" }),
      providesTags: [{ type: "Fee", id: "SUMMARY" }],
    }),
    payFee: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/fees/${id}/pay`, method: "POST", data: body }),
      invalidatesTags: [{ type: "Fee", id: "MY" }, { type: "Fee", id: "LIST" }, { type: "Fee", id: "SUMMARY" }],
    }),
    updateFee: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/fees/${id}`, method: "PATCH", data: body }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }, { type: "Fee", id: "SUMMARY" }],
    }),
    deleteFee: builder.mutation({
      query: (id) => ({ url: `/fees/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateFeeMutation,
  useCreateBulkFeesMutation,
  useGetFeesQuery,
  useGetMyFeesQuery,
  useGetFeeSummaryQuery,
  usePayFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feeApiSlice;
