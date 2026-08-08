import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", data: body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", data: body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    refresh: builder.mutation({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    getMe: builder.query({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", data: body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", data: body }),
    }),
    updatePassword: builder.mutation({
      query: (body) => ({ url: "/auth/update-password", method: "PATCH", data: body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
} = authApiSlice;
