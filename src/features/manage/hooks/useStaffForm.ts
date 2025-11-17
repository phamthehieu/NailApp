import { useCallback } from "react";
import { getListBookingHourSettingApi, getListBookingHourSettingByStaffIdApi, getListStaffApi } from "../api/BookingApi";
import { setListBookingHourSetting, setListBookingHourSettingByStaffId, setListStaff } from "../model/staffSlice";
import { useAppDispatch } from "@/app/store";
import { setListService } from "../model/editBookingSlice";


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


    const getListBookingHourSettingByStaffId = useCallback(async (staffId: number) => {
        try {
            const response = await getListBookingHourSettingByStaffIdApi(staffId);
            dispatch(setListBookingHourSettingByStaffId(response));
        } catch (error) {
            console.error(error);
        }
    }, []);

    return {
        getListStaff,
        getListBookingHourSetting,
        getListBookingHourSettingByStaffId,
    };
}