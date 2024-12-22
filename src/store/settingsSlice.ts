import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  apiKey: string | null;
}

const initialState: SettingsState = {
  apiKey: localStorage.getItem('anthropicApiKey'),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string | null>) => {
      state.apiKey = action.payload;
      if (action.payload) {
        localStorage.setItem('anthropicApiKey', action.payload);
      } else {
        localStorage.removeItem('anthropicApiKey');
      }
    },
  },
});

export const { setApiKey } = settingsSlice.actions;

export default settingsSlice.reducer; 