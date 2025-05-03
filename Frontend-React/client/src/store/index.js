import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomsReducer from './slices/roomsSlice';
import bookingsReducer from './slices/bookingsSlice';
import servicesReducer from './slices/servicesSlice';
import invoicesReducer from './slices/invoicesSlice';
import feedbackReducer from './slices/feedbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    bookings: bookingsReducer,
    services: servicesReducer,
    invoices: invoicesReducer,
    feedback: feedbackReducer,
  },
  // Add middleware to persist state to localStorage
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values like Dates
        ignoredActions: ['bookings/createBooking', 'bookings/updateBooking', 'invoices/createInvoice', 'invoices/updateInvoice'],
      },
    }),
});