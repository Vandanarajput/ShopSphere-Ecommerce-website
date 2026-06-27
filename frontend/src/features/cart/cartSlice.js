import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/cart');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart.');
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/cart/items', { productId, quantity });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart.');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/cart/items/${productId}`, { quantity });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update cart.');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.delete(`/cart/items/${productId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item.');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.delete('/cart');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart.');
  }
});

const initialState = {
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  loading: false,
  error: null,
  toast: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: () => initialState,
    clearToast(state) {
      state.toast = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setData = (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.discount = action.payload.discount || 0;
      state.tax = action.payload.tax || 0;
      state.shipping = action.payload.shipping || 0;
      state.total = action.payload.total || 0;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, setData)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addToCart.pending, (state) => { state.error = null; })
      .addCase(addToCart.fulfilled, (state, action) => {
        setData(state, action);
        toast.success('Added to cart');
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not add to cart');
      })

      .addCase(updateCartItem.fulfilled, setData)
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not update cart');
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        setData(state, action);
        toast('Removed from cart', { icon: '🗑️' });
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        toast.error(action.payload || 'Could not remove item');
      })

      .addCase(clearCart.fulfilled, (state, action) => {
        setData(state, action);
        toast('Cart cleared', { icon: '🧹' });
      });
  },
});

export const { resetCart, clearToast } = cartSlice.actions;
export default cartSlice.reducer;
