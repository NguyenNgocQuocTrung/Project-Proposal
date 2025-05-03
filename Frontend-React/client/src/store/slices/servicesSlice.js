import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockServices } from '@/lib/mockData';

// Initial state
const initialState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
};

// Load services from localStorage
const loadServicesFromStorage = () => {
  try {
    const storedServices = localStorage.getItem('hotelServices');
    return storedServices ? JSON.parse(storedServices) : mockServices;
  } catch (error) {
    console.error('Error loading services from localStorage:', error);
    return mockServices;
  }
};

// Save services to localStorage
const saveServicesToStorage = (services) => {
  try {
    localStorage.setItem('hotelServices', JSON.stringify(services));
  } catch (error) {
    console.error('Error saving services to localStorage:', error);
  }
};

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll load data from localStorage or use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const services = loadServicesFromStorage();
          resolve(services);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (serviceId, { rejectWithValue, getState }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll search in our local state first, and if not found, check localStorage
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { services } = getState().services;
          
          // First check if we have the service in our state
          let service = services.find(s => s.id === serviceId);
          
          // If not found in state, try to get it from localStorage
          if (!service) {
            const storedServices = loadServicesFromStorage();
            service = storedServices.find(s => s.id === serviceId);
          }
          
          if (service) {
            resolve(service);
          } else {
            reject(new Error('Service not found'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Services slice
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    addService: (state, action) => {
      const newService = {
        ...action.payload,
        id: Date.now(), // Simple ID generation for demo
      };
      state.services.push(newService);
      saveServicesToStorage(state.services);
    },
    updateService: (state, action) => {
      const index = state.services.findIndex(service => service.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
        saveServicesToStorage(state.services);
        if (state.currentService && state.currentService.id === action.payload.id) {
          state.currentService = action.payload;
        }
      }
    },
    deleteService: (state, action) => {
      state.services = state.services.filter(service => service.id !== action.payload);
      saveServicesToStorage(state.services);
      if (state.currentService && state.currentService.id === action.payload) {
        state.currentService = null;
      }
    },
    clearServiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services cases
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch services';
      })
      // Fetch service by ID cases
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch service';
      });
  },
});

export const {
  addService,
  updateService,
  deleteService,
  clearServiceError,
} = servicesSlice.actions;

export default servicesSlice.reducer;