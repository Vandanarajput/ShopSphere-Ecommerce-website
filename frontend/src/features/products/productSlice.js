import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/products', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products.');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/products/${id}`);
      return data.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Product not found.');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/categories');
      return data.data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories.');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    product: null,
    categories: [],
    pagination: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      sort: '-createdAt',
      page: 1,
      limit: 12,
    },
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    clearProduct(state) {
      state.product = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.product = null; state.error = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});

export const { setFilters, setPage, clearProduct } = productSlice.actions;
export default productSlice.reducer;
