import { useAppDispatch, useAppSelector } from "@/app/store";
import { getlistBookingManagerApi } from "@/features/manage/api/BookingApi";
import { appendListBookingManager, setListBookingManager } from "@/features/manage/model/bookingSlice";
import { alertService } from "@/services/alertService";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export function useDashBoardHook() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { pageIndex: reduxPageIndex, historyBookingItem } = useAppSelector((state) => state.booking);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | null>(new Date());
    const [status, setStatus] = useState<number | null>(null);
    const [bookingCode, setBookingCode] = useState<string | undefined>(undefined);
    const [customerName, setCustomerName] = useState<string | undefined>(undefined);
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [pageSize, setPageSize] = useState<number | undefined>(10);
    const [sortType, setSortType] = useState<string | undefined>(undefined);
    const [staffId, setStaffId] = useState<number | null>(null);

    const getListBookingByDashBoard = useCallback(async (isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const safeReduxPageIndex = Math.max(0, reduxPageIndex || 0);
            const currentPageIndex = isLoadMore ? safeReduxPageIndex + 1 : 0;
            const finalPageIndex = Math.max(0, currentPageIndex);
            const response = await getlistBookingManagerApi(dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, finalPageIndex, pageSize, sortType, staffId);
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
    }, [dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, reduxPageIndex, pageSize, sortType, dispatch, t, staffId]);

    const loadMoreBookings = useCallback(async () => {
        await getListBookingByDashBoard(true);
    }, [getListBookingByDashBoard]);

    const resetFilters = useCallback(() => {
        setDateFrom(null);
        setDateTo(null);
        setBookingDate(new Date());
        setStatus(null);
        setBookingCode(undefined);
        setCustomerName(undefined);
        setPhone(undefined);
    }, []);

    return {
        getListBookingByDashBoard,
        loading,
        loadingMore,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        bookingDate,
        setBookingDate,
        status,
        setStatus,
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
        setSortType,
        staffId,
        setStaffId,
        loadMoreBookings,
        resetFilters,
    }
}

export type DashBoardHookResult = ReturnType<typeof useDashBoardHook>;