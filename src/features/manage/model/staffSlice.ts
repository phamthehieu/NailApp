import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListBookingHourResponse, ListStaffResponse, StaffItem } from "../api/types";

interface StaffState {
    listStaff: StaffItem[];
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    selectedStaff: StaffItem | null;
    listBookingHour: ListBookingHourResponse[];
}

const initialState: StaffState = {
    listStaff: [],
    pageIndex: 0,
    totalItems: 0,
    pageSize: 0,
    totalPages: 0,
    loading: false,
    error: null,
    selectedStaff: null,
    listBookingHour: [],
};

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        setListStaff(state, action: PayloadAction<ListStaffResponse>) {
            state.listStaff = action.payload.items;
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
        clearStaffState(state) {
            state.listStaff = [];
            state.pageIndex = 0;
            state.totalItems = 0;
            state.pageSize = 0;
            state.totalPages = 0;
            state.loading = false;
            state.error = null;
            state.selectedStaff = null;
        },
        setListBookingHour(state, action: PayloadAction<ListBookingHourResponse[]>) {
            state.listBookingHour = action.payload;
        },
    },
});

export const {
    setListStaff,
    setLoading,
    setError,
    clearStaffState,
    setListBookingHour,
} = staffSlice.actions;

export default staffSlice.reducer;





