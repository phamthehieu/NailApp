import { useCallback } from "react";
import { getListBookingHourSettingApi, getListStaffApi } from "../api/BookingApi";
import { setListBookingHourSetting, setListStaff } from "../model/staffSlice";
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

    const getListBookingHourSetting = useCallback(async () => {
        try {
            const response = await getListBookingHourSettingApi();
            dispatch(setListBookingHourSetting(response));
        } catch (error) {
            console.error(error);
        }
    }, []);
    return {
        getListStaff,
        getListBookingHourSetting,
    };
}