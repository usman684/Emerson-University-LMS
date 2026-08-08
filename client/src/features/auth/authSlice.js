import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true, // true while we attempt silent refresh on app load
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    finishInitializing: (state) => {
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, clearCredentials, finishInitializing } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitializing = (state) => state.auth.isInitializing;
