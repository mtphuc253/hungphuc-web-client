import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getSettings } from "@/services/settingsService";
import type { Setting } from "@/types";

// Define the shape of the settings object
export interface SiteSettings {
  ticker_messages?: string;
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
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  status: "idle",
  error: null,
};

// ✅ Async thunk cho API mới (trả về Setting[])
export const fetchSettings = createAsyncThunk<Setting[], void, { rejectValue: string }>(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const settings = await getSettings(); // giờ getSettings() trả về mảng Setting[]
      if (!Array.isArray(settings)) {
        return rejectWithValue("Invalid settings data received from server");
      }
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch settings");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Setting[]>) => {
        state.status = "succeeded";
        // ✅ Chuyển mảng settings thành object key-value để dễ truy cập
        state.settings = action.payload.reduce((acc: SiteSettings, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch settings";
      });
  },
});

export default settingsSlice.reducer;
