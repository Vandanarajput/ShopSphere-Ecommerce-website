import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const fetchReviews = createAsyncThunk(
  'reviews/fetch',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/products/${productId}/reviews`);
      return data.data.reviews;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews.');
    }
  }
);

export const postReview = createAsyncThunk(
  'reviews/post',
  async ({ productId, rating, title, comment }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/products/${productId}/reviews`, {
        rating, title, comment,
      });
      return data.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to post review.');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete review.');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearReviews(state) { state.list = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(postReview.fulfilled, (state, action) => {
        const review = action.payload;
        const idx = state.list.findIndex((r) => r._id === review._id);
        if (idx >= 0) state.list[idx] = review;
        else state.list.unshift(review);
        toast.success('Review posted');
      })
      .addCase(postReview.rejected, (state, action) => {
        toast.error(action.payload || 'Could not post review');
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
        toast('Review deleted', { icon: '🗑️' });
      })
      .addCase(deleteReview.rejected, (state, action) => {
        toast.error(action.payload || 'Could not delete review');
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
