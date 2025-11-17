import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListBookingSettingResponse, ListServiceResponse } from "../api/types"

interface EditBookingState {
    listBookingSetting: ListBookingSettingResponse | null;
    listService: ListServiceResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: EditBookingState = {
    listBookingSetting: null,
    listService: null,
    loading: false,
    error: null,

}

const editBookingSlice = createSlice({
    name: 'editBooking',
    initialState,
    reducers: {
        setListBookingSetting(state, action: PayloadAction<ListBookingSettingResponse>) {
            state.listBookingSetting = action.payload;
        },
        setListService(state, action: PayloadAction<ListServiceResponse>) {
            state.listService = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
            state.loading = false;
        },
        clearEditBookingState(state) {
            state.listBookingSetting = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    setListBookingSetting,
    setListService,
    setLoading,
    setError,
    clearEditBookingState,
} = editBookingSlice.actions;

export default editBookingSlice.reducer;