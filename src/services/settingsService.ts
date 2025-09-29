
// This function transforms the raw key-value array from the API 

import axiosClient from "@/lib/axiosClient";

// into a more usable structured object.
const transformSettings = (settings: { key: string; value: string }[]) => {
  const settingsObject: { [key: string]: any } = {};
  
  for (const setting of settings) {
    if (setting.key === 'ticker_messages') {
      // The format is now a single string with messages separated by commas.
      if (typeof setting.value === 'string') {
        settingsObject[setting.key] = setting.value.split(',').map(msg => msg.trim());
      } else {
        settingsObject[setting.key] = [];
      }
    } else {
      settingsObject[setting.key] = setting.value;
    }
  }
  return settingsObject;
};

export const getSettings = async () => {
  try {
    const response = await axiosClient.get("/api/settings");

    if (response.data.success && Array.isArray(response.data.data)) {
      return transformSettings(response.data.data);
    } else {
      console.error("API did not return valid settings data.", response.data);
      return {};
    }
  } catch (err) {
    console.error("Error fetching settings:", err);
    throw err; // Re-throw to be handled by the async thunk
  }
};
