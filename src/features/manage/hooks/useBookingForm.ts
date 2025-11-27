import { useAppDispatch, useAppSelector } from "@/app/store";
import { useCallback, useState } from "react";
import { getDetailBookingItemApi, getHistoryBookingItemApi, getlistBookingManagerApi, getListBookingStatusApi, getListTimeSlotApi, postCancelBookingApi, putCheckinBookingApi, putEditBookingApi } from "../api/BookingApi";
import { setListBookingManager, setListBookingStatus, appendListBookingManager, resetPageIndex, setDetailBookingItem, setHistoryBookingItem, appendHistoryBookingItem, setFilters, resetFilters } from "../model/bookingSlice";
import { alertService } from "@/services/alertService";
import { useTranslation } from "react-i18next";
import { EditBookingRequest } from "../api/types";


export function useBookingForm() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { pageIndex: reduxPageIndex, historyBookingItem, filters } = useAppSelector((state) => state.booking);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
    const bookingDate = filters.bookingDate ? new Date(filters.bookingDate) : null;
    const status = filters.status;
    const bookingCode = filters.bookingCode;
    const customerName = filters.customerName;
    const phone = filters.phone;
    const search = filters.search;
    const sortBy = filters.sortBy;
    const sortType = filters.sortType;
    const pageSize = filters.pageSize;

    const setDateFrom = useCallback((value: Date | null) => {
        dispatch(setFilters({ dateFrom: value ? value.toISOString() : null }));
    }, [dispatch]);

    const setDateTo = useCallback((value: Date | null) => {
        dispatch(setFilters({ dateTo: value ? value.toISOString() : null }));
    }, [dispatch]);

    const setBookingDate = useCallback((value: Date | null) => {
        dispatch(setFilters({ bookingDate: value ? value.toISOString() : null }));
    }, [dispatch]);

    const setStatus = useCallback((value: number | null) => {
        dispatch(setFilters({ status: value }));
    }, [dispatch]);

    const setBookingCode = useCallback((value: string | undefined) => {
        dispatch(setFilters({ bookingCode: value }));
    }, [dispatch]);

    const setCustomerName = useCallback((value: string | undefined) => {
        dispatch(setFilters({ customerName: value }));
    }, [dispatch]);

    const setPhone = useCallback((value: string | undefined) => {
        dispatch(setFilters({ phone: value }));
    }, [dispatch]);

    const setSearch = useCallback((value: string | undefined) => {
        dispatch(setFilters({ search: value }));
    }, [dispatch]);

    const setSortBy = useCallback((value: string | undefined) => {
        dispatch(setFilters({ sortBy: value }));
    }, [dispatch]);

    const setSortType = useCallback((value: string | undefined) => {
        dispatch(setFilters({ sortType: value }));
    }, [dispatch]);

    const setPageSize = useCallback((value: number | undefined) => {
        dispatch(setFilters({ pageSize: value }));
    }, [dispatch]);

    const getListBookingManager = useCallback(async (isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const safeReduxPageIndex = Math.max(0, reduxPageIndex || 0);
            const currentPageIndex = isLoadMore ? safeReduxPageIndex + 1 : 0;
            const finalPageIndex = Math.max(0, currentPageIndex);
            const response = await getlistBookingManagerApi(dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, finalPageIndex, pageSize, sortType);
            if (isLoadMore) {
                dispatch(appendListBookingManager(response));
            } else {
                dispatch(setListBookingManager(response));
            }
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
            setLoadingMore(false);
        }
    }, [filters, reduxPageIndex, dispatch, t]);

    const getListBookingManagerByDate = useCallback(async (bookingDate: Date, searchText: string) => {
        try {
            if (loading) return;
            setLoading(true);
            const pageSizeDate = 10000;
            const response = await getlistBookingManagerApi(undefined, undefined, bookingDate, undefined, undefined, undefined, undefined, searchText, undefined, undefined, pageSizeDate, undefined);
            dispatch(setListBookingManager(response));
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
    }, [dispatch, t, loading]);

    const getListBookingManagerByRange = useCallback(async (startDate?: Date | null, endDate?: Date | null, searchText?: string, staffId?: number) => {
        try {
            if (loading) return;
            setLoading(true);
            const pageSizeDate = 10000;
            const response = await getlistBookingManagerApi(startDate, endDate, undefined, undefined, undefined, undefined, undefined, searchText, undefined, undefined, pageSizeDate, undefined, staffId);
            dispatch(setListBookingManager(response));
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
    }, [dispatch, t, loading]);

    const loadMoreBookings = useCallback(async () => {
        if (loadingMore || loading) return;
        try {
            setLoadingMore(true);
            const safeReduxPageIndex = Math.max(0, reduxPageIndex || 0);
            const currentPageIndex = safeReduxPageIndex + 1;
            const finalPageIndex = Math.max(0, currentPageIndex);

            const response = await getlistBookingManagerApi(dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, finalPageIndex, pageSize, sortType);
            dispatch(appendListBookingManager(response));
        } catch (error: any) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoadingMore(false);
        }
    }, [filters, reduxPageIndex, dispatch, t, loadingMore, loading]);

    const resetPagination = useCallback(() => {
        dispatch(resetFilters());
        dispatch(resetPageIndex());
    }, [dispatch]);


    const getListBookingStatus = useCallback(async () => {
        try {
            const response = await getListBookingStatusApi();
            dispatch(setListBookingStatus(response));
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

    const getDetailBookingItem = useCallback(async (bookingCode: string) => {
        try {
            setLoading(true);
            const response = await getDetailBookingItemApi(bookingCode);
            dispatch(setDetailBookingItem(response));
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
    }, [dispatch, t, loading]);

    const getHistoryBookingItem = useCallback(async (CustomerId?: string, Search?: string, SortBy?: string, PageIndex?: number, PageSize?: number, SortType?: string, isLoadMore: boolean = false) => {
        try {
            if (loading && !isLoadMore) return;
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const pageSizeHistory = 10000;
            const response = await getHistoryBookingItemApi(CustomerId, Search, SortBy, PageIndex, pageSizeHistory, SortType);
            if (isLoadMore) {
                dispatch(appendHistoryBookingItem(response));
            } else {
                dispatch(setHistoryBookingItem(response));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [dispatch, loading]);

    const loadMoreHistoryBookings = useCallback(async (CustomerId?: string, Search?: string, SortBy?: string, PageSize?: number, SortType?: string) => {
        if (!historyBookingItem || loadingMore) return;

        const currentPageIndex = historyBookingItem.pageIndex || 0;
        const totalPages = historyBookingItem.totalPages || 0;

        if (currentPageIndex >= totalPages - 1) return;

        await getHistoryBookingItem(CustomerId, Search, SortBy, currentPageIndex + 1, PageSize, SortType, true);
    }, [historyBookingItem, loadingMore, getHistoryBookingItem]);

    const putEditBooking = useCallback(async (data: EditBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await putEditBookingApi(data);
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
    }, [dispatch, t]);


    const postCancelBooking = useCallback(async (bookingId: number) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await postCancelBookingApi({bookingId});
            return response;
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


    const putCheckinBooking = useCallback(async (data: EditBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await putCheckinBookingApi(data);
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
    }, [dispatch, t]);


    const getListTimeSlot = useCallback(async (date: Date) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await getListTimeSlotApi(date);
            return response;
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
    }, [dispatch, t, loading]);
    return {
        getListBookingManager,
        getListBookingStatus,
        loadMoreBookings,
        resetPagination,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        bookingCode,
        setBookingCode,
        customerName,
        setCustomerName,
        phone,
        setPhone,
        search,
        setSearch,
        sortBy,
        setSortBy,
        pageSize,
        setPageSize,
        sortType,
        status,
        setStatus,
        bookingDate,
        setBookingDate,
        loading,
        setLoading,
        loadingMore,
        getDetailBookingItem,
        getListBookingManagerByDate,
        getHistoryBookingItem,
        loadMoreHistoryBookings,
        getListBookingManagerByRange,
        putEditBooking,
        postCancelBooking,
        putCheckinBooking,
        getListTimeSlot,
    }
}