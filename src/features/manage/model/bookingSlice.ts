

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookingManagerItem, DetailBookingItemResponse, HistoryBookingItemResponse, ListBookingManagerResponse, ListBookingStatusResponse } from "../api/types";

interface BookingListState {
    listBookingManager: BookingManagerItem[];
    listBookingManagerByDate: BookingManagerItem[];
    listBookingManagerByRange: BookingManagerItem[];
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    listBookingStatus: ListBookingStatusResponse | null;
    detailBookingItem: DetailBookingItemResponse | null;
    historyBookingItem: HistoryBookingItemResponse | null;
}

const initialState: BookingListState = {
    listBookingManager: [],
    listBookingManagerByDate: [],
    listBookingManagerByRange: [],
    pageIndex: 0,
    totalItems: 0,
    pageSize: 0,
    totalPages: 0,
    loading: false,
    error: null,
    listBookingStatus: null,
    detailBookingItem: null,
    historyBookingItem: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setListBookingManager(state, action: PayloadAction<ListBookingManagerResponse>) {
            state.listBookingManager = action.payload.items;
            state.listBookingManagerByDate = action.payload.items;
            state.listBookingManagerByRange = action.payload.items;
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
        setDetailBookingItem(state, action: PayloadAction<DetailBookingItemResponse>) {
            state.detailBookingItem = action.payload;
        },
        setHistoryBookingItem(state, action: PayloadAction<HistoryBookingItemResponse>) {
            state.historyBookingItem = action.payload;
        },
        appendHistoryBookingItem(state, action: PayloadAction<HistoryBookingItemResponse>) {
            if (state.historyBookingItem) {
                state.historyBookingItem.items = [...state.historyBookingItem.items, ...action.payload.items];
                state.historyBookingItem.pageIndex = action.payload.pageIndex;
                state.historyBookingItem.totalItems = action.payload.totalItems;
                state.historyBookingItem.pageSize = action.payload.pageSize;
                if (action.payload.totalPages > state.historyBookingItem.totalPages) {
                    state.historyBookingItem.totalPages = action.payload.totalPages;
                }
            } else {
                state.historyBookingItem = action.payload;
            }
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
    setDetailBookingItem,
    setHistoryBookingItem,
    appendHistoryBookingItem,
} = bookingSlice.actions;

export default bookingSlice.reducer;




