import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockInvoices } from '@/lib/mockData';

// Initial state
const initialState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
};

// Load invoices from localStorage
const loadInvoicesFromStorage = () => {
  try {
    const storedInvoices = localStorage.getItem('hotelInvoices');
    return storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
  } catch (error) {
    console.error('Error loading invoices from localStorage:', error);
    return mockInvoices;
  }
};

// Save invoices to localStorage
const saveInvoicesToStorage = (invoices) => {
  try {
    localStorage.setItem('hotelInvoices', JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoices to localStorage:', error);
  }
};

// Generate invoice ID
const generateInvoiceId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}-${randomPart}`;
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll load data from localStorage or use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const invoices = loadInvoicesFromStorage();
          resolve(invoices);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (invoiceId, { rejectWithValue, getState }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll search in our local state first, and if not found, check localStorage
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { invoices } = getState().invoices;
          
          // First check if we have the invoice in our state
          let invoice = invoices.find(i => i.id === invoiceId);
          
          // If not found in state, try to get it from localStorage
          if (!invoice) {
            const storedInvoices = loadInvoicesFromStorage();
            invoice = storedInvoices.find(i => i.id === invoiceId);
          }
          
          if (invoice) {
            resolve(invoice);
          } else {
            reject(new Error('Invoice not found'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Invoices slice
const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    createInvoice: (state, action) => {
      const newInvoice = {
        ...action.payload,
        id: action.payload.id || generateInvoiceId(),
        date: action.payload.date || new Date().toISOString().split('T')[0],
      };
      state.invoices.push(newInvoice);
      saveInvoicesToStorage(state.invoices);
    },
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
        saveInvoicesToStorage(state.invoices);
        if (state.currentInvoice && state.currentInvoice.id === action.payload.id) {
          state.currentInvoice = action.payload;
        }
      }
    },
    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      saveInvoicesToStorage(state.invoices);
      if (state.currentInvoice && state.currentInvoice.id === action.payload) {
        state.currentInvoice = null;
      }
    },
    markInvoiceAsPaid: (state, action) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload);
      if (index !== -1) {
        state.invoices[index] = {
          ...state.invoices[index],
          status: 'paid',
        };
        saveInvoicesToStorage(state.invoices);
        if (state.currentInvoice && state.currentInvoice.id === action.payload) {
          state.currentInvoice = {
            ...state.currentInvoice,
            status: 'paid',
          };
        }
      }
    },
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices cases
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch invoices';
      })
      // Fetch invoice by ID cases
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch invoice';
      });
  },
});

export const {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  clearInvoiceError,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;