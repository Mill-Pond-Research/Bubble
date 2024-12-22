import { configureStore } from '@reduxjs/toolkit';
import thoughtsReducer from './thoughtsSlice';
import appReducer from './appSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    thoughts: thoughtsReducer,
    app: appReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 