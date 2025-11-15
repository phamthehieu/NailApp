

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookingManagerItem, BookingStatusItem, ListBookingManagerResponse, ListBookingStatusResponse } from "../api/BookingApi";

interface BookingListState {
    listBookingManager: BookingManagerItem[];
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    listBookingStatus: ListBookingStatusResponse | null;
}

const initialState: BookingListState = {
    listBookingManager: [],
    pageIndex: 0,
    totalItems: 0,
    pageSize: 0,
    totalPages: 0,
    loading: false,
    error: null,
    listBookingStatus: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setListBookingManager(state, action: PayloadAction<ListBookingManagerResponse>) {
            state.listBookingManager = action.payload.items;
            state.pageIndex = action.payload.pageIndex;
            state.totalItems = action.payload.totalItems;
            state.pageSize = action.payload.pageSize;
            state.totalPages = action.payload.totalPages;
            state.loading = false;
            state.error = null;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
            state.loading = false;
        },
        clearBookingListState(state) {
            state.listBookingManager = [];
            state.pageIndex = 0;
            state.totalItems = 0;
            state.pageSize = 0;
            state.totalPages = 0;
            state.loading = false;
            state.error = null;
        },
        setListBookingStatus(state, action: PayloadAction<ListBookingStatusResponse>) {
            state.listBookingStatus = action.payload;
            state.loading = false;
            state.error = null;
        },
        appendListBookingManager(state, action: PayloadAction<ListBookingManagerResponse>) {
            state.listBookingManager = [...state.listBookingManager, ...action.payload.items];
            state.pageIndex = action.payload.pageIndex;
            state.totalItems = action.payload.totalItems;
            state.pageSize = action.payload.pageSize;
            if (action.payload.totalPages > state.totalPages) {
                state.totalPages = action.payload.totalPages;
            }
            if (state.totalPages === 0 && action.payload.totalPages > 0) {
                state.totalPages = action.payload.totalPages;
            }
            state.loading = false;
            state.error = null;
        },
        resetPageIndex(state) {
            state.pageIndex = 0;
        },
    },
});

export const {
    setListBookingManager,
    setLoading,
    setError,
    clearBookingListState,
    setListBookingStatus,
    appendListBookingManager,
    resetPageIndex,
} = bookingSlice.actions;

export default bookingSlice.reducer;




