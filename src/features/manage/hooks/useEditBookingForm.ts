import { useCallback, useState } from "react";
import { useAppDispatch } from "@/app/store";
import { setListBookingSetting, setListService } from "../model/editBookingSlice";
import { getListBookingSettingApi, getListServiceApi } from "../api/BookingApi";
import { alertService } from "@/services/alertService";
import { useTranslation } from "react-i18next";
export function useEditBookingForm() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const getListBookingSetting = useCallback(async () => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListBookingSettingApi();
            dispatch(setListBookingSetting(response));
        } catch (error) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: t('bookingList.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoading(false);
        }
    }, [t, dispatch, loading]);

    const getListService = useCallback(async (SystemCatalogId?: number, Search?: string, SortBy?: number, PageIndex?: number, PageSize?: number, SortType?: string) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListServiceApi(SystemCatalogId, Search, SortBy, PageIndex, PageSize, SortType);
            dispatch(setListService(response));
        } catch (error) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: t('bookingList.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoading(false);
        }
    }, [dispatch, t]);

    return {
        getListBookingSetting,
        loading,
        getListService,
    };
}