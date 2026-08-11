import { apiSlice } from "../api/apiSlice";

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({ url: "/events", method: "GET", params }),
      providesTags: [{ type: "Event", id: "LIST" }],
    }),
    createEvent: builder.mutation({
      query: (body) => ({ url: "/events", method: "POST", data: body }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/events/${id}`, method: "PATCH", data: body }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApiSlice;
