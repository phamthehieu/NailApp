import { http } from "@/services/api/http";
import type {
    ListStaffResponse,
    ListBookingHourSettingResponse,
    ListBookingManagerResponse,
    ListBookingStatusResponse,
    DetailBookingItemResponse,
    HistoryBookingItemResponse,
    ListBookingSettingResponse,
    ListServiceResponse
} from "./types";

export type {
    ListStaffResponse,
    ListBookingHourSettingResponse,
    ListBookingManagerResponse,
    ListBookingStatusResponse,
    BookingManagerItem,
    BookingStatusItem,
    ServiceItem,
    StaffItem,
    DetailBookingItemResponse,
    StatusObjDetailBookingItemR,
    ServiceDetailBookingItemResponse,
    StaffDetailBookingItemResponse,
    RoleObjDetailBookingItemResponse,
    Frequency,
    Customer
} from "./types";

export const getListStaffApi = async () => {
    return http.getPortal<ListStaffResponse>('/api/Staff/List');
}

export const getListBookingHourSettingApi = async () => {
    return http.getPortal<ListBookingHourSettingResponse[]>('/api/BookingHours/ListSetting');
}

const pad = (value: number) => value.toString().padStart(2, '0');

const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const getlistBookingManagerApi = async (
    dateFrom?: Date | null,
    dateTo?: Date | null,
    bookingDate?: Date | null,
    status?: string,
    bookingCode?: string,
    customerName?: string,
    phone?: string,
    search?: string,
    sortBy?: string,
    pageIndex?: number,
    pageSize?: number,
    sortType?: string,
    staffId?: number,
) => {
    const params = new URLSearchParams();

    if (dateFrom) {
        params.append('FromDate', formatDateParam(dateFrom));
    }
    if (dateTo) {
        params.append('ToDate', formatDateParam(dateTo));
    }
    if (bookingDate) {
        params.append('BookingDate', formatDateParam(bookingDate));
    }
    if (status) {
        params.append('Status', status);
    }
    if (bookingCode) {
        params.append('BookingCode', bookingCode);
    }
    if (customerName) {
        params.append('CustomerName', customerName);
    }
    if (phone) {
        params.append('CustomerPhone', phone);
    }
    if (search) {
        params.append('Search', search);
    }
    if (sortBy) {
        params.append('SortBy', sortBy);
    }
    const safePageIndex = pageIndex !== undefined && pageIndex !== null && pageIndex >= 0 ? pageIndex : 0;
    if (safePageIndex > 0) {
        params.append('PageIndex', safePageIndex.toString());
    }
    if (pageSize) {
        params.append('PageSize', pageSize.toString());
    }
    if (sortType) {
        params.append('SortType', sortType);
    }
    if (staffId) {
        params.append('StaffId', staffId.toString());
    }
    return http.get<ListBookingManagerResponse>(`/api/Booking/List?${params.toString()}`);
}

export const getListBookingStatusApi = async () => {
    return http.get<ListBookingStatusResponse>('/api/Booking/ListBookingStatus');
}

export const getDetailBookingItemApi = async (bookingCode: string) => {
    return http.get<DetailBookingItemResponse>(`/api/Booking/Get/${bookingCode}`);
}

export const getHistoryBookingItemApi = async (CustomerId?: string, Search?: string, SortBy?: string,PageIndex?: number, PageSize?: number, SortType?: string) => {
    const params = new URLSearchParams();
    if (CustomerId) {
        params.append('CustomerId', CustomerId);
    }
    if (Search) {
        params.append('Search', Search);
    }
    if (SortBy) {
        params.append('SortBy', SortBy);
    }
    if (PageIndex) {
        params.append('PageIndex', PageIndex.toString());
    }
    if (PageSize) {
        params.append('PageSize', PageSize.toString());
    }
    if (SortType) {
        params.append('SortType', SortType);
    }
    return http.get<HistoryBookingItemResponse>(`/api/Booking/HistoryBooking?${params.toString()}`);
}

export const getListBookingHourSettingByStaffIdApi = async (staffId: number) => {
    return http.getPortal<ListBookingHourSettingResponse[]>(`/api/BookingHours/ListBookingHoursByStaffId?staffId=${staffId}`);
}

export const getListBookingSettingApi = async () => {
    return http.get<ListBookingSettingResponse>('/api/Booking/GetBookingSetting');
}

export const getListServiceApi = async (SystemCatalogId?: number, Search?: string, SortBy?: number, PageIndex?: number, PageSize?: number, SortType?: string) => {
    const params = new URLSearchParams();
    if (SystemCatalogId) {
        params.append('SystemCatalogId', SystemCatalogId.toString());
    }
    if (Search) {
        params.append('Search', Search);
    }
    if (SortBy) {
        params.append('SortBy', SortBy.toString());
    }
    if (PageIndex) {
        params.append('PageIndex', PageIndex.toString());
    }
    if (PageSize) {
        params.append('PageSize', PageSize.toString());
    }
    if (SortType) {
        params.append('SortType', SortType);
    }
    return http.get<ListServiceResponse>(`/api/ServiceManagement/List?${params.toString()}`);
}
