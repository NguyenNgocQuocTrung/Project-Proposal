import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockFeedbacks } from '@/lib/mockData';

// Initial state
const initialState = {
  feedbacks: [],
  currentFeedback: null,
  loading: false,
  error: null,
};

// Load feedbacks from localStorage
const loadFeedbacksFromStorage = () => {
  try {
    const storedFeedbacks = localStorage.getItem('hotelFeedbacks');
    return storedFeedbacks ? JSON.parse(storedFeedbacks) : mockFeedbacks;
  } catch (error) {
    console.error('Error loading feedbacks from localStorage:', error);
    return mockFeedbacks;
  }
};

// Save feedbacks to localStorage
const saveFeedbacksToStorage = (feedbacks) => {
  try {
    localStorage.setItem('hotelFeedbacks', JSON.stringify(feedbacks));
  } catch (error) {
    console.error('Error saving feedbacks to localStorage:', error);
  }
};

// Async thunks
export const fetchFeedbacks = createAsyncThunk(
  'feedbacks/fetchFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll load data from localStorage or use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const feedbacks = loadFeedbacksFromStorage();
          resolve(feedbacks);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeedbackById = createAsyncThunk(
  'feedbacks/fetchFeedbackById',
  async (feedbackId, { rejectWithValue, getState }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll search in our local state first, and if not found, check localStorage
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { feedbacks } = getState().feedback;
          
          // First check if we have the feedback in our state
          let feedback = feedbacks.find(f => f.id === feedbackId);
          
          // If not found in state, try to get it from localStorage
          if (!feedback) {
            const storedFeedbacks = loadFeedbacksFromStorage();
            feedback = storedFeedbacks.find(f => f.id === feedbackId);
          }
          
          if (feedback) {
            resolve(feedback);
          } else {
            reject(new Error('Feedback not found'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Feedbacks slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    addFeedback: (state, action) => {
      const newFeedback = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      state.feedbacks.push(newFeedback);
      saveFeedbacksToStorage(state.feedbacks);
    },
    updateFeedback: (state, action) => {
      const index = state.feedbacks.findIndex(feedback => feedback.id === action.payload.id);
      if (index !== -1) {
        state.feedbacks[index] = action.payload;
        saveFeedbacksToStorage(state.feedbacks);
        if (state.currentFeedback && state.currentFeedback.id === action.payload.id) {
          state.currentFeedback = action.payload;
        }
      }
    },
    deleteFeedback: (state, action) => {
      state.feedbacks = state.feedbacks.filter(feedback => feedback.id !== action.payload);
      saveFeedbacksToStorage(state.feedbacks);
      if (state.currentFeedback && state.currentFeedback.id === action.payload) {
        state.currentFeedback = null;
      }
    },
    updateFeedbackStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.feedbacks.findIndex(feedback => feedback.id === id);
      if (index !== -1) {
        state.feedbacks[index] = {
          ...state.feedbacks[index],
          status,
        };
        saveFeedbacksToStorage(state.feedbacks);
        if (state.currentFeedback && state.currentFeedback.id === id) {
          state.currentFeedback = {
            ...state.currentFeedback,
            status,
          };
        }
      }
    },
    clearFeedbackError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feedbacks cases
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch feedbacks';
      })
      // Fetch feedback by ID cases
      .addCase(fetchFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch feedback';
      });
  },
});

export const {
  addFeedback,
  updateFeedback,
  deleteFeedback,
  updateFeedbackStatus,
  clearFeedbackError,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;