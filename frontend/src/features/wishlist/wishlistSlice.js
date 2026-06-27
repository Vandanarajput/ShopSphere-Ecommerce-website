import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/wishlist');
      return data.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist.');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/wishlist/${productId}`);
      return data.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist.');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.delete(`/wishlist/${productId}`);
      return data.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove.');
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  toast: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: () => initialState,
    clearWishlistToast(state) { state.toast = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
        toast('Saved to wishlist', { icon: '❤️' });
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not save to wishlist');
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
        toast('Removed from wishlist', { icon: '💔' });
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        toast.error(action.payload || 'Could not remove from wishlist');
      });
  },
});

export const { resetWishlist, clearWishlistToast } = wishlistSlice.actions;
export default wishlistSlice.reducer;
