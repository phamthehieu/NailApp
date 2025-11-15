import { http } from "@/services/api/http";

export interface ListStaffResponse {
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    items: StaffItem[];
}

export interface StaffItem {
    displayName: string;
    description: string | null;
    email: string;
    phoneNumber: string;
    role: number;
    roleObj: {
        id: number;
        name: string;
    };
    tenantId: number;
    tenant: string | null;
    username: string;
    status: number;
    isAdmin: boolean;
    bufferTime: string | null;
    staffLogin: string | null;
    avatarUrl: string | null;
    id: number;
    creator: string | null;
    createdAt: string;
    lastModifiedAt: string;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
}

export interface ListBookingHourResponse {
    tenantId: number;
    staffId: number;
    dayOfTheWeek: string;
    startTime: string;
    endTime: string;
    active: boolean;
    isValidated: boolean;
    createdAt: string;
    creatorId: number;
    creator: string | null;
    lastModifiedAt: string;
    lastModifierId: number;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
    id: number;
    code: string | null;
    name: string | null;
}

export interface ListBookingManagerResponse {
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    items: BookingManagerItem[];
}

export interface BookingManagerItem {
    code: string;
    bookingDate: string;
    bookingHours: string;
    status: number;
    statusObj: {
        id: number;
        name: string;
    };
    description: string;
    services: ServiceItem[];
    frequency: {
        frequencyType: number;
        fromDate: string;
        endDate: string;
    };
    customer: {
        id: number;
        name: string;
        phoneNumber: string;
        email: string;
    };
    id: number;
    creator: string | null;
    createdAt: string;
    lastModifiedAt: string;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
}

export interface ServiceItem {
    id: number;
    serviceName: string;
    serviceCode: string | null;
    price: number;
    serviceTime: number;
    staff: StaffItem | null;
    promotion: any | null;
}

export interface StaffItem {
    id: number;
    username: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    role: number;
    roleObj: {
        id: number;
        name: string;
    }
}

export interface ListBookingStatusResponse {
    items: BookingStatusItem[];
}

export interface BookingStatusItem {
    id: number;
    name: string;
}

export const getListStaffApi = async () => {
    return http.getPortal<ListStaffResponse>('/api/Staff/List');
}

export const getListBookingHourApi = async () => {
    return http.getPortal<ListBookingHourResponse[]>('/api/BookingHours/List');
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
    dateFrom: Date | null,
    dateTo: Date | null,
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
) => {
    const params = new URLSearchParams();
    console.log('dateFrom', dateFrom?.toISOString());
    console.log('dateTo', dateTo?.toISOString());

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

    return http.get<ListBookingManagerResponse>(`/api/Booking/List?${params.toString()}`);
}

export const getListBookingStatusApi = async () => {
    return http.get<ListBookingStatusResponse>('/api/Booking/ListBookingStatus');
}