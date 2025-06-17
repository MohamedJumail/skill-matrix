import { createSlice } from '@reduxjs/toolkit';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user'); 

const authSlice = createSlice({
  name: 'auth',
  initialState: {
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
      state.user = null; 
      state.token = null; 
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user'); 
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;