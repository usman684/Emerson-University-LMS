import { apiSlice } from "../api/apiSlice";

export const threadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourseThreads: builder.query({
      query: (courseId) => ({ url: `/threads/course/${courseId}`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Thread", id: courseId }],
    }),
    getThreadById: builder.query({
      query: (id) => ({ url: `/threads/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Thread", id }],
    }),
    createThread: builder.mutation({
      query: (body) => ({ url: "/threads", method: "POST", data: body }),
      invalidatesTags: (result, error, body) => [{ type: "Thread", id: body.course }],
    }),
    addReply: builder.mutation({
      query: ({ id, content }) => ({ url: `/threads/${id}/replies`, method: "POST", data: { content } }),
      invalidatesTags: (result, error, { id }) => [{ type: "Thread", id }],
    }),
    togglePin: builder.mutation({
      query: (id) => ({ url: `/threads/${id}/pin`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [{ type: "Thread", id }],
    }),
    toggleLock: builder.mutation({
      query: (id) => ({ url: `/threads/${id}/lock`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [{ type: "Thread", id }],
    }),
    deleteThread: builder.mutation({
      query: (id) => ({ url: `/threads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Thread"],
    }),
  }),
});

export const {
  useGetCourseThreadsQuery,
  useGetThreadByIdQuery,
  useCreateThreadMutation,
  useAddReplyMutation,
  useTogglePinMutation,
  useToggleLockMutation,
  useDeleteThreadMutation,
} = threadApiSlice;
