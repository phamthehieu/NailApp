import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from '@/features/auth/model/authSlice';
import storeReducer from '@/features/store/model/storeSlice';
import staffReducer from '@/features/manage/model/staffSlice';
import bookingReducer from '@/features/manage/model/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    store: storeReducer,
    staff: staffReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
