import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isDarkMode: boolean;
}

const initialState: AppState = {
  isDarkMode: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { setDarkMode, toggleDarkMode } = appSlice.actions;

export default appSlice.reducer; 