import { useCallback } from "react";
import { getListBookingHourSettingApi, getListBookingHourSettingByStaffIdApi, getListStaffApi } from "../api/BookingApi";
import { setListBookingHourSetting, setListBookingHourSettingByStaffId, setListStaff } from "../model/staffSlice";
import { useAppDispatch } from "@/app/store";
import { setListService } from "../model/editBookingSlice";
import { alertService } from "@/services/alertService";
import { useTranslation } from "react-i18next";


export function useStaffForm() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const getListStaff = useCallback(async () => {
        try {
            const response = await getListStaffApi();
            dispatch(setListStaff(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
    }, [dispatch, t]);

    const getListBookingHourSetting = useCallback(async () => {
        try {
            const response = await getListBookingHourSettingApi();
            dispatch(setListBookingHourSetting(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
    }, [dispatch, t]);


    const getListBookingHourSettingByStaffId = useCallback(async (staffId: number) => {
        try {
            const response = await getListBookingHourSettingByStaffIdApi(staffId);
            dispatch(setListBookingHourSettingByStaffId(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
    }, [dispatch, t]);

    return {
        getListStaff,
        getListBookingHourSetting,
        getListBookingHourSettingByStaffId,
    };
}