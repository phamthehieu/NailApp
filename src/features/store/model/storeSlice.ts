import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListChooseShopResponse } from "../api/storeApi";

interface StoreState {
    listChooseShop: ListChooseShopResponse[];
}

const initialState: StoreState = {
    listChooseShop: [],
}

const storeSlice = createSlice({
    name: 'store',
    initialState,
    reducers: {
        setListChooseShop(state, action: PayloadAction<ListChooseShopResponse[]>) {
            state.listChooseShop = action.payload;
        },
    },
});

export const { setListChooseShop } = storeSlice.actions;

export default storeSlice.reducer;