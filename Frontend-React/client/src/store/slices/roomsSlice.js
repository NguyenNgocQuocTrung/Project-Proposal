import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockRooms } from '@/lib/mockData';

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
};

// Load rooms from localStorage
const loadRoomsFromStorage = () => {
  try {
    const storedRooms = localStorage.getItem('hotelRooms');
    return storedRooms ? JSON.parse(storedRooms) : mockRooms;
  } catch (error) {
    console.error('Error loading rooms from localStorage:', error);
    return mockRooms;
  }
};

// Save rooms to localStorage
const saveRoomsToStorage = (rooms) => {
  try {
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
  } catch (error) {
    console.error('Error saving rooms to localStorage:', error);
  }
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll load data from localStorage or use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const rooms = loadRoomsFromStorage();
          resolve(rooms);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (roomId, { rejectWithValue, getState }) => {
    try {
      // In a real application, this would be an API call
      // For now, we'll search in our local state first, and if not found, check localStorage
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { rooms } = getState().rooms;
          
          // First check if we have the room in our state
          let room = rooms.find(r => r.id === roomId);
          
          // If not found in state, try to get it from localStorage
          if (!room) {
            const storedRooms = loadRoomsFromStorage();
            room = storedRooms.find(r => r.id === roomId);
          }
          
          if (room) {
            resolve(room);
          } else {
            reject(new Error('Room not found'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Rooms slice
const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    addRoom: (state, action) => {
      const newRoom = {
        ...action.payload,
        id: Date.now(), // Simple ID generation for demo
      };
      state.rooms.push(newRoom);
      saveRoomsToStorage(state.rooms);
    },
    updateRoom: (state, action) => {
      const index = state.rooms.findIndex(room => room.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
        saveRoomsToStorage(state.rooms);
      }
    },
    deleteRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      saveRoomsToStorage(state.rooms);
      if (state.currentRoom && state.currentRoom.id === action.payload) {
        state.currentRoom = null;
      }
    },
    clearRoomError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rooms cases
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rooms';
      })
      // Fetch room by ID cases
      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch room';
      });
  },
});

export const { addRoom, updateRoom, deleteRoom, clearRoomError } = roomsSlice.actions;

export default roomsSlice.reducer;