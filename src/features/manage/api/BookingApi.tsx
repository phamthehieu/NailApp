import { http } from "@/services/api/http";
import type {
    ListStaffResponse,
    ListBookingHourSettingResponse,
    ListBookingManagerResponse,
    ListBookingStatusResponse,
    DetailBookingItemResponse,
    HistoryBookingItemResponse,
    ListBookingSettingResponse,
    ListServiceResponse,
    ListBookingFrequencyResponse,
    ListCustomerListResponse,
    CreateUserBookingRequest,
    CreateBookingRequest,
    EditBookingRequest,
    ListPromotionResponse,
    CustomerCreateBookingRequest,
    PutPaymentBookingRequest,
    ListStaffManager,
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
    ServiceDetailBookingItemResponse,
    StaffDetailBookingItemResponse,
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
    status?: number | null,
    bookingCode?: string,
    customerName?: string,
    phone?: string,
    search?: string,
    sortBy?: string,
    pageIndex?: number,
    pageSize?: number,
    sortType?: string,
    staffId?: number | null,
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
    if (status !== null && status !== undefined) {
        params.append('Status', status.toString());
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

export const getListServiceApi = async (BookingDate?: string, BookingTime?: string, SystemCatalogId?: number, Search?: string, SortBy?: number, PageIndex?: number, PageSize?: number, SortType?: string) => {
    const params = new URLSearchParams();
    if (BookingDate) {
        params.append('BookingDate', BookingDate);
    }
    if (BookingTime) {
        params.append('BookingTime', BookingTime);
    }
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
    return http.get<ListServiceResponse>(`/api/Booking/GetServiceManagementByConfigPrice?${params.toString()}`);
}

export const getListBookingFrequencyApi = async () => {
    return http.get<ListBookingFrequencyResponse[]>('/api/Booking/ListBookingFrequecy');
}

export const getListCustomerListApi = async (PageSize?: number, name?: string) => {
    const params = new URLSearchParams();
    if (PageSize) {
        params.append('PageSize', PageSize.toString());
    }
    if (name) {
        params.append('Name', name);
    }
    return http.get<ListCustomerListResponse>(`/api/Customer/List?${params.toString()}`);
}

export const postCreateUserBookingApi = async (data: CreateUserBookingRequest) => {
    return http.post<any>('/api/Customer/Create', data);
}

export const postCreateBookingApi = async (data: CreateBookingRequest) => {
    return http.post<any>('/api/Booking/Create', data);
}

export const putEditBookingApi = async (data: EditBookingRequest) => {
    return http.put<any>('/api/Booking/Update', data);
}

export const postCancelBookingApi = async (data: {bookingId: number}) => {
    return http.post<any>('/api/Booking/Cancel', data);
}

export const putCheckinBookingApi = async (data: EditBookingRequest) => {
    return http.put<any>('/api/Booking/CheckIn', data);
}

export const getListPromotionApi = async (PageIndex?: number, PageSize?: number, ServiceManagementIds?: number) => {
    const params = new URLSearchParams();
    if (PageIndex) {
        params.append('PageIndex', PageIndex.toString());
    }
    if (PageSize) {
        params.append('PageSize', PageSize.toString());
    }
    if (ServiceManagementIds) {
        params.append('ServiceManagementIds', ServiceManagementIds.toString());
    }
    return http.get<ListPromotionResponse>(`/api/Promotion/List?${params.toString()}`);
}

export const getListPaymentTypeApi = async () => {
    return http.get<CustomerCreateBookingRequest[]>('/api/Booking/ListBookingPaymentType');
}

export const getCheckVoucherApi = async (voucherCode: string) => {
    return http.get<any>(`/api/Vouchers/CheckVoucher/${voucherCode}`);
}

export const putPaymentBookingApi = async (data: PutPaymentBookingRequest) => {
    return http.put<any>('/api/Booking/Payment', data);
}

export const getListTimeSlotApi = async (date: Date) => {
    return http.get<any>(`/api/Booking/ListTimeRangeBooking?FromDate=${formatDateParam(date)}`);
}

export const getListStaffManagerApi = async () => {
    return http.get<ListStaffManager[]>('/api/ServiceManagement/ListStaff');
}