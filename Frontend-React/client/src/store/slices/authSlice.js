import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll just simulate authentication for demo purposes
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock successful login with admin@hotel.com / password
          if (email === 'admin@hotel.com' && password === 'password') {
            resolve({
              id: 1,
              name: 'Admin User',
              email: 'admin@hotel.com',
              role: 'admin',
            });
          } else {
            throw new Error('Invalid credentials');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // In a real application, this would be an API call
    // For now, we'll just simulate it
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;