import { createSlice } from '@reduxjs/toolkit';

// Load token and user from localStorage initially
const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user'); // <--- NEW: Try to load user data

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // If a token exists AND user data exists, parse the user data. Otherwise, user is null.
    user: savedToken && savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user)); // <--- NEW: Store user data
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null; // Clear user on failure
      state.token = null; // Clear token on failure
      localStorage.removeItem('token'); // Clear token
      localStorage.removeItem('user'); // <--- NEW: Clear user data on failure
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // <--- NEW: Clear user data on logout
    },
    // You could optionally add a 'setUser' reducer here if you fetch user data independently
    // after initial load (e.g., for token revalidation), but for this issue, direct
    // persistence is the most straightforward fix.
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;