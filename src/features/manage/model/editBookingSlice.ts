import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListBookingFrequencyResponse, ListBookingSettingResponse, ListCustomerListResponse, ListServiceResponse } from "../api/types"

interface EditBookingState {
    listBookingSetting: ListBookingSettingResponse | null;
    listService: ListServiceResponse | null;
    listBookingFrequency: ListBookingFrequencyResponse[] | null;
    listCustomerList: ListCustomerListResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: EditBookingState = {
    listBookingSetting: null,
    listService: null,
    listBookingFrequency: [],
    listCustomerList: null,
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
        setListBookingFrequency(state, action: PayloadAction<ListBookingFrequencyResponse[]>) {
            state.listBookingFrequency = action.payload;
        },
        setListCustomerList(state, action: PayloadAction<ListCustomerListResponse>) {
            state.listCustomerList = action.payload;
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
    setListBookingFrequency,
    setListCustomerList,
    setLoading,
    setError,
    clearEditBookingState,
} = editBookingSlice.actions;

export default editBookingSlice.reducer;