import { configureStore } from '@reduxjs/toolkit';
import thoughtsReducer from './thoughtsSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    thoughts: thoughtsReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 