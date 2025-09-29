import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getSettings } from "@/services/settingsService";

// Define the shape of the settings object
export interface SiteSettings {
  ticker_messages?: string[];
  logo_url?: string;
  email?: string;
  abbname?: string;
  engName?: string;
  vnName?: string;
  phone?: string;
  address?: string;
  [key: string]: any; // Allow for other potential settings
}

interface SettingsState {
  settings: SiteSettings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  status: 'idle',
  error: null,
};

// Async thunk for fetching settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await getSettings();
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<SiteSettings>) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
