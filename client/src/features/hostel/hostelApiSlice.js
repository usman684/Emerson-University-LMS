import { apiSlice } from "../api/apiSlice";

export const hostelApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHostels: builder.query({
      query: () => ({ url: "/hostels", method: "GET" }),
      providesTags: [{ type: "Hostel", id: "LIST" }],
    }),
    createHostel: builder.mutation({
      query: (body) => ({ url: "/hostels", method: "POST", data: body }),
      invalidatesTags: [{ type: "Hostel", id: "LIST" }],
    }),
    getRoomsByHostel: builder.query({
      query: (hostelId) => ({ url: `/hostels/${hostelId}/rooms`, method: "GET" }),
      providesTags: (result, error, hostelId) => [{ type: "Room", id: hostelId }],
    }),
    createRoom: builder.mutation({
      query: ({ hostelId, ...body }) => ({
        url: `/hostels/${hostelId}/rooms`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { hostelId }) => [{ type: "Room", id: hostelId }],
    }),
    allocateStudent: builder.mutation({
      query: ({ roomId, student }) => ({
        url: `/hostels/rooms/${roomId}/allocate`,
        method: "POST",
        data: { student },
      }),
      invalidatesTags: ["Room"],
    }),
    deallocateStudent: builder.mutation({
      query: ({ roomId, student }) => ({
        url: `/hostels/rooms/${roomId}/deallocate`,
        method: "POST",
        data: { student },
      }),
      invalidatesTags: ["Room"],
    }),
    getMyAllocation: builder.query({
      query: () => ({ url: "/hostels/me", method: "GET" }),
      providesTags: [{ type: "Room", id: "ME" }],
    }),
  }),
});

export const {
  useGetHostelsQuery,
  useCreateHostelMutation,
  useGetRoomsByHostelQuery,
  useCreateRoomMutation,
  useAllocateStudentMutation,
  useDeallocateStudentMutation,
  useGetMyAllocationQuery,
} = hostelApiSlice;
