import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import skillMatrixReducer from '../features/auth/skillMatrixSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    skillMatrix: skillMatrixReducer,
  },
});