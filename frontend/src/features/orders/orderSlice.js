import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const createOrder = createAsyncThunk(
  'orders/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/orders', payload);
      return data.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to place order.');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/orders/my-orders');
      return data.data.orders;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders.');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/orders/${id}`);
      return data.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Order not found.');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/orders/${id}/cancel`);
      return data.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel.');
    }
  }
);

// Fake payment confirmation — sends card to backend, backend pretends to charge it.
export const payMockOrder = createAsyncThunk(
  'orders/payMock',
  async ({ orderId, cardNumber }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/orders/${orderId}/pay-mock`, { cardNumber });
      return data.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment failed.');
    }
  }
);

// ---- Admin thunks ----
export const fetchAllOrders = createAsyncThunk(
  'orders/admin/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/admin/orders', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders.');
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'orders/admin/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/admin/orders/${id}/status`, { status });
      return data.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status.');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    current: null,
    lastCreated: null,
    loading: false,
    placing: false,
    error: null,
    adminList: [],
    adminPagination: null,
    adminLoading: false,
  },
  reducers: {
    clearLastCreated(state) { state.lastCreated = null; },
    clearOrderError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.placing = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.lastCreated = action.payload;
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = action.payload;
        toast.error(action.payload || 'Could not place order');
      })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.current = null; state.error = null; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.current = action.payload;
        state.list = state.list.map((o) => o._id === action.payload._id ? action.payload : o);
        toast('Order cancelled', { icon: '🚫' });
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not cancel order');
      })

      .addCase(payMockOrder.fulfilled, (state, action) => {
        state.lastCreated = action.payload;
        state.current = action.payload;
        toast.success('Payment successful!');
      })
      .addCase(payMockOrder.rejected, (state, action) => {
        // Don't toast here — the modal shows its own inline error so user sees it next to the form
      })

      // Admin: fetch all orders
      .addCase(fetchAllOrders.pending, (state) => { state.adminLoading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminList = action.payload.orders;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })

      // Admin: update status
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.adminList = state.adminList.map((o) => (o._id === updated._id ? updated : o));
        toast.success(`Order moved to ${updated.orderStatus}`);
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        toast.error(action.payload || 'Could not update status');
      });
  },
});

export const { clearLastCreated, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
