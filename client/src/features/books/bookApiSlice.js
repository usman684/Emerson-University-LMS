import { apiSlice } from "../api/apiSlice";

export const bookApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: (params) => ({ url: "/books", method: "GET", params }),
      providesTags: [{ type: "Book", id: "LIST" }],
    }),
    createBook: builder.mutation({
      query: (body) => ({ url: "/books", method: "POST", data: body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    updateBook: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/books/${id}`, method: "PATCH", data: body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({ url: `/books/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    issueBook: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/books/${id}/issue`, method: "POST", data: body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }, { type: "BookIssue", id: "LIST" }],
    }),
    returnBook: builder.mutation({
      query: (issueId) => ({ url: `/books/issues/${issueId}/return`, method: "POST" }),
      invalidatesTags: [{ type: "Book", id: "LIST" }, { type: "BookIssue", id: "LIST" }],
    }),
    getAllIssues: builder.query({
      query: (params) => ({ url: "/books/issues", method: "GET", params }),
      providesTags: [{ type: "BookIssue", id: "LIST" }],
    }),
    getMyIssues: builder.query({
      query: () => ({ url: "/books/issues/me", method: "GET" }),
      providesTags: [{ type: "BookIssue", id: "MY" }],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useIssueBookMutation,
  useReturnBookMutation,
  useGetAllIssuesQuery,
  useGetMyIssuesQuery,
} = bookApiSlice;
