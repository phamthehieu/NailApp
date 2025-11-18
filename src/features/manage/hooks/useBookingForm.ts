import { useAppDispatch, useAppSelector } from "@/app/store";
import { useCallback, useState } from "react";
import { getDetailBookingItemApi, getHistoryBookingItemApi, getlistBookingManagerApi, getListBookingStatusApi, postCancelBookingApi, putCheckinBookingApi, putEditBookingApi } from "../api/BookingApi";
import { setListBookingManager, setListBookingStatus, appendListBookingManager, resetPageIndex, setDetailBookingItem, setHistoryBookingItem, appendHistoryBookingItem } from "../model/bookingSlice";
import { alertService } from "@/services/alertService";
import { useTranslation } from "react-i18next";
import { EditBookingRequest } from "../api/types";


export function useBookingForm() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { pageIndex: reduxPageIndex, historyBookingItem } = useAppSelector((state) => state.booking);
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | null>(null);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [bookingCode, setBookingCode] = useState<string | undefined>(undefined);
    const [customerName, setCustomerName] = useState<string | undefined>(undefined);
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [pageSize, setPageSize] = useState<number | undefined>(3);
    const [sortType, setSortType] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

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
            setLoadingMore(false);
        }
    }, [dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, reduxPageIndex, pageSize, sortType, dispatch]);

    const getListBookingManagerByDate = useCallback(async (bookingDate: Date, searchText: string) => {
        try {
            if (loading) return;
            setLoading(true);
            const pageSizeDate = 10000;
            const response = await getlistBookingManagerApi(undefined, undefined, bookingDate, undefined, undefined, undefined, undefined, searchText, undefined, undefined, pageSizeDate, undefined);
            dispatch(setListBookingManager(response));
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
    }, [dispatch, t, loading]);

    const getListBookingManagerByRange = useCallback(async (startDate?: Date | null, endDate?: Date | null, searchText?: string, staffId?: number) => {
        try {
            if (loading) return;
            setLoading(true);
            const pageSizeDate = 10000;
            const response = await getlistBookingManagerApi(startDate, endDate, undefined, undefined, undefined, undefined, undefined, searchText, undefined, undefined, pageSizeDate, undefined, staffId);
            dispatch(setListBookingManager(response));
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
    }, [dispatch, t, loading]);

    const loadMoreBookings = useCallback(async () => {
        await getListBookingManager(true);
    }, [getListBookingManager]);

    const resetPagination = useCallback(() => {
        setDateFrom(null);
        setDateTo(null);
        setBookingDate(null);
        setStatus(undefined);
        setBookingCode(undefined);
        setCustomerName(undefined);
        setPhone(undefined);
        setSearch(undefined);
        setSortBy(undefined);
        setPageSize(3);
        setSortType(undefined);
        setBookingCode(undefined);
        setCustomerName(undefined);
        setPhone(undefined);
        setSearch(undefined);
        setSortBy(undefined);
        setPageSize(3);
        setSortType(undefined);
        dispatch(resetPageIndex());
    }, [dispatch]);


    const getListBookingStatus = useCallback(async () => {
        try {
            const response = await getListBookingStatusApi();
            dispatch(setListBookingStatus(response));
        } catch (error) {
            console.error(error);
            alertService.showAlert({
                title: t('bookingList.errorTitle'),
                message: t('bookingList.errorMessage'),
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
    }, [dispatch, t, loading]);

    const getHistoryBookingItem = useCallback(async (CustomerId?: string, Search?: string, SortBy?: string, PageIndex?: number, PageSize?: number, SortType?: string, isLoadMore: boolean = false) => {
        try {
            if (loading && !isLoadMore) return;
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const response = await getHistoryBookingItemApi(CustomerId, Search, SortBy, PageIndex, PageSize, SortType);
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
        catch (error) {
            console.error(error);
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


    const putCheckinBooking = useCallback(async (data: EditBookingRequest) => {
        try {
            if (loading) return;
            setLoading(true);
            const response = await putCheckinBookingApi(data);
            return response;
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }, [dispatch, t]);
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
    }
}