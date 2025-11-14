import { useAppDispatch } from "@/app/store";
import { useCallback, useMemo, useState } from "react";
import { startOfDay } from 'date-fns';
import { getlistBookingManagerApi, getListBookingStatusApi } from "../api/BookingApi";
import { setListBookingManager, setListBookingStatus } from "../model/bookingSlice";


type ZonedDateParts = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
};


export function useBookingForm() {
    const dispatch = useAppDispatch();
    const [dateFrom, setDateFrom] = useState<Date | null>(startOfDay(new Date()));
    const [dateTo, setDateTo] = useState<Date | null>(new Date());
    const [bookingDate, setBookingDate] = useState<Date | null>(null);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [bookingCode, setBookingCode] = useState<string | undefined>(undefined);
    const [customerName, setCustomerName] = useState<string | undefined>(undefined);
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [pageIndex, setPageIndex] = useState<number | undefined>(undefined);
    const [pageSize, setPageSize] = useState<number | undefined>(undefined);
    const [sortType, setSortType] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const getListBookingManager = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getlistBookingManagerApi(dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, pageIndex, pageSize, sortType);
            dispatch(setListBookingManager(response));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, bookingDate, status, bookingCode, customerName, phone, search, sortBy, pageIndex, pageSize, sortType, loading]);


    const getListBookingStatus = useCallback(async () => {
        try {
            const response = await getListBookingStatusApi();
            dispatch(setListBookingStatus(response));
        } catch (error) {
            console.error(error);
        }
    }, []);

    return {
        getListBookingManager,
        getListBookingStatus,
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
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize,
        sortType,
        status,
        setStatus,
        bookingDate,
        setBookingDate,
        loading,
        setLoading,
    }
}