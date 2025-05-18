import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookings } from '@/lib/mockData';
import { api } from '@/services/api';

// Initial state
const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

// Load bookings from localStorage
const loadBookingsFromStorage = () => {
  try {
    const storedBookings = localStorage.getItem('hotelBookings');
    return storedBookings ? JSON.parse(storedBookings) : mockBookings;
  } catch (error) {
    console.error('Error loading bookings from localStorage:', error);
    return mockBookings;
  }
};

// Save bookings to localStorage
const saveBookingsToStorage = (bookings) => {
  try {
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const bookings = loadBookingsFromStorage();
          resolve(bookings);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (bookingId, { rejectWithValue, getState }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll search in our local state first, and if not found, check localStorage
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { bookings } = getState().bookings;

          // First check if we have the booking in our state
          let booking = bookings.find(b => b.id === bookingId);

          // If not found in state, try to get it from localStorage
          if (!booking) {
            const storedBookings = loadBookingsFromStorage();
            booking = storedBookings.find(b => b.id === bookingId);
          }

          if (booking) {
            resolve(booking);
          } else {
            reject(new Error('Booking not found'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBookingAsync = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.bookings.create(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

// Bookings slice
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    createBooking: (state, action) => {
      const newBooking = {
        ...action.payload,
        id: Date.now(), // Simple ID generation for demo
        isCheckedOut: false,
        isCancelled: false,
      };
      state.bookings.push(newBooking);
      saveBookingsToStorage(state.bookings);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
        saveBookingsToStorage(state.bookings);
        if (state.currentBooking && state.currentBooking.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      }
    },
    deleteBooking: (state, action) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
      saveBookingsToStorage(state.bookings);
      if (state.currentBooking && state.currentBooking.id === action.payload) {
        state.currentBooking = null;
      }
    },
    cancelBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload);
      if (index !== -1) {
        state.bookings[index] = {
          ...state.bookings[index],
          isCancelled: true,
        };
        saveBookingsToStorage(state.bookings);
        if (state.currentBooking && state.currentBooking.id === action.payload) {
          state.currentBooking = {
            ...state.currentBooking,
            isCancelled: true,
          };
        }
      }
    },
    checkoutBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload);
      if (index !== -1) {
        state.bookings[index] = {
          ...state.bookings[index],
          isCheckedOut: true,
        };
        saveBookingsToStorage(state.bookings);
        if (state.currentBooking && state.currentBooking.id === action.payload) {
          state.currentBooking = {
            ...state.currentBooking,
            isCheckedOut: true,
          };
        }
      }
    },
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings cases
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })
      // Fetch booking by ID cases
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch booking';
      })
      // Create booking cases
      .addCase(createBookingAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBookingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  checkoutBooking,
  clearBookingError,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;