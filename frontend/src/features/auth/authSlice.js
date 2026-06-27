import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

const storedUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
const storedToken = localStorage.getItem('shopsphere_token') || null;

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/register', formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/login', formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed.');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/auth/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put('/users/profile', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile.');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put('/auth/change-password', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to change password.');
    }
  }
);

export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (address, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/users/addresses', address);
      return data.data.addresses;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add address.');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.delete(`/users/addresses/${addressId}`);
      return data.data.addresses;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete address.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('shopsphere_user');
      localStorage.removeItem('shopsphere_token');
      toast('Logged out', { icon: '👋' });
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('shopsphere_user', JSON.stringify(action.payload.user));
      localStorage.setItem('shopsphere_token', action.payload.token);
    };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        fulfilled(state, action);
        toast.success(`Welcome, ${action.payload.user?.name || 'there'}!`);
      })
      .addCase(registerUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload || 'Registration failed');
      })
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        fulfilled(state, action);
        toast.success(`Welcome back, ${action.payload.user?.name || 'there'}!`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload || 'Login failed');
      })
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('shopsphere_user', JSON.stringify(action.payload));
      })
      .addCase(fetchMe.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
          localStorage.setItem('shopsphere_user', JSON.stringify(state.user));
        }
        toast.success('Profile updated');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not update profile');
      })

      .addCase(changePassword.fulfilled, () => {
        toast.success('Password changed successfully');
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not change password');
      })

      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
          localStorage.setItem('shopsphere_user', JSON.stringify(state.user));
        }
        toast.success('Address saved');
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload || 'Could not save address');
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
          localStorage.setItem('shopsphere_user', JSON.stringify(state.user));
        }
        toast('Address removed', { icon: '🗑️' });
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
