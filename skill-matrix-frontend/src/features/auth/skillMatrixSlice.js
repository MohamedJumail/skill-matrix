import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchSkillMatrix = createAsyncThunk(
  'skillMatrix/fetchSkillMatrix',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employee/approved-skill-matrix');
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Server error');
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const skillMatrixSlice = createSlice({
  name: 'skillMatrix',
  initialState: {
    data: null,
    selectedSkill: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedSkill: (state, action) => {
      state.selectedSkill = action.payload;
    },
    clearSelectedSkill: (state) => {
      state.selectedSkill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkillMatrix.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillMatrix.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.selectedSkill = null;
      })
      .addCase(fetchSkillMatrix.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
        state.selectedSkill = null;
      });
  },
});

export const { setSelectedSkill, clearSelectedSkill } = skillMatrixSlice.actions;
export default skillMatrixSlice.reducer;