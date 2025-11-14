import { useCallback } from "react";
import { getListBookingHourApi, getListStaffApi } from "../api/BookingApi";
import { setListBookingHour, setListStaff } from "../model/staffSlice";
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

    const getListBookingHour = useCallback(async () => {
        try {
            const response = await getListBookingHourApi();
            dispatch(setListBookingHour(response));
        } catch (error) {
            console.error(error);
        }
    }, []);
    return {
        getListStaff,
        getListBookingHour,
    }
}