import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.rooms.getAll();
      console.log('API Response:', response);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.rooms.getById(roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await api.rooms.create(roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      const response = await api.rooms.update(id, roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      await api.rooms.delete(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAvailableRooms = createAsyncThunk(
  'rooms/fetchAvailableRooms',
  async ({ checkInDate, checkOutDate }, { rejectWithValue }) => {
    try {
      const response = await api.rooms.getAvailable(checkInDate, checkOutDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Rooms slice
const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
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
      })
      // Create room cases
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create room';
      })
      // Update room cases
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rooms.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update room';
      })
      // Delete room cases
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(room => room.id !== action.payload);
        if (state.currentRoom && state.currentRoom.id === action.payload) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete room';
      });
  },
});

export const { clearRoomError } = roomsSlice.actions;

export default roomsSlice.reducer;