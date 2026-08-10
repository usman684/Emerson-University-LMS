import { apiSlice } from "../api/apiSlice";

export const transportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query({
      query: () => ({ url: "/transport", method: "GET" }),
      providesTags: [{ type: "Vehicle", id: "LIST" }],
    }),
    createVehicle: builder.mutation({
      query: (body) => ({ url: "/transport", method: "POST", data: body }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }],
    }),
    subscribeToRoute: builder.mutation({
      query: (id) => ({ url: `/transport/${id}/subscribe`, method: "POST" }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }, { type: "Vehicle", id: "ME" }],
    }),
    unsubscribeFromRoute: builder.mutation({
      query: (id) => ({ url: `/transport/${id}/unsubscribe`, method: "POST" }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }, { type: "Vehicle", id: "ME" }],
    }),
    getMySubscription: builder.query({
      query: () => ({ url: "/transport/me", method: "GET" }),
      providesTags: [{ type: "Vehicle", id: "ME" }],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useSubscribeToRouteMutation,
  useUnsubscribeFromRouteMutation,
  useGetMySubscriptionQuery,
} = transportApiSlice;
