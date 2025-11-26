import { useCallback, useState } from "react";
import { useAppDispatch } from "@/app/store";
import { setListBookingFrequency, setListBookingSetting, setListCustomerList, setListPaymentType, setListPromotion, setListService, setListStaffManager } from "../model/editBookingSlice";
import { getCheckVoucherApi, getListBookingFrequencyApi, getListBookingSettingApi, getListCustomerListApi, getListPaymentTypeApi, getListPromotionApi, getListServiceApi, getListStaffManagerApi, postCreateBookingApi, postCreateUserBookingApi, putPaymentBookingApi } from "../api/BookingApi";
import { alertService } from "@/services/alertService";
import { useTranslation } from "react-i18next";
import { CreateBookingRequest, CreateUserBookingRequest, PutPaymentBookingRequest } from "../api/types";
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
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoading(false);
        }
    }, [t, dispatch, loading]);

    const getListService = useCallback(async (BookingDate?: string, BookingTime?: string, SystemCatalogId?: number, Search?: string, SortBy?: number, PageIndex?: number, PageSize?: number, SortType?: string) => {
        try {
            if (loading) return;
            setLoading(true);
            const PageSize = 10000;
            const response = await getListServiceApi(BookingDate, BookingTime, SystemCatalogId, Search, SortBy, PageIndex, PageSize, SortType);
            dispatch(setListService(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoading(false);
        }
    }, [dispatch, t]);

    const getListBookingFrequency = useCallback(async () => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListBookingFrequencyApi();
            dispatch(setListBookingFrequency(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoading(false);
        }
    }, [dispatch, t]);

    const getListCustomerList = useCallback(async (name?: string) => {
        try {
            const PageSize = 10000;
            if (loading) return;
            setLoading(true);
            const response = await getListCustomerListApi(PageSize, name);
            dispatch(setListCustomerList(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);

    const postCreateUserBooking = useCallback(async (data: CreateUserBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await postCreateUserBookingApi(data);
            return response;
        }
        catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [t, loading]);

    const postCreateBooking = useCallback(async (data: CreateBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await postCreateBookingApi(data);
            return response;
        }
        catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [t, loading]);

    const getListPromotion = useCallback(async (PageIndex?: number, ServiceManagementIds?: number) => {
        try {
            if (loading) return;
            setLoading(true);
            const PageSize = 10000;
            const response = await getListPromotionApi(PageIndex, PageSize, ServiceManagementIds);
            dispatch(setListPromotion(response));
        }
        catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);

    const getListPaymentType = useCallback(async () => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListPaymentTypeApi();
            dispatch(setListPaymentType(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);

    const getCheckVoucher = useCallback(async (voucherCode: string) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getCheckVoucherApi(voucherCode);
            return response;
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);


    const putPaymentBooking = useCallback(async (data: PutPaymentBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await putPaymentBookingApi(data);
            return response;
        }
        catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);

    const getListStaffManager = useCallback(async () => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListStaffManagerApi();
            dispatch(setListStaffManager(response));
        }
        catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t, loading]);

    return {
        getListBookingSetting,
        getListService,
        getListBookingFrequency,
        getListCustomerList,
        postCreateUserBooking,
        postCreateBooking,
        loading,
        getListPromotion,
        getListPaymentType,
        getCheckVoucher,
        putPaymentBooking,
        getListStaffManager,
    };
}
