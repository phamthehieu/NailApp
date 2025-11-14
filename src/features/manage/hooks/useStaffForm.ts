import { useCallback } from "react";
import { getListStaffApi } from "../api/BookingApi";
import { setListStaff } from "../model/staffSlice";
import { useAppDispatch } from "@/app/store";


export function useStaffForm() {
    const dispatch = useAppDispatch();
    const getListStaff = useCallback(async () => {
        try {
            const response = await getListStaffApi();
            dispatch(setListStaff(response));
        } catch (error) {
            console.error(error);
        }
    }, []);

    return {
        getListStaff,
    }
}