// ==================== Common Base Types ====================

/** Base entity fields that appear in most responses */
export interface BaseEntity {
    id: number;
    creator: string | null;
    createdAt: string;
    lastModifiedAt: string;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
}

/** Common pagination response structure */
export interface PaginationResponse<T> {
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    items: T[];
}

/** Common ID-Name pair used for roles, statuses, etc. */
export interface IdNamePair {
    id: number;
    name: string;
}

/** Customer information */
export interface Customer {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
}

/** Frequency information */
export interface Frequency {
    frequencyType: number;
    fromDate: string;
    endDate: string;
}

// ==================== Staff Types ====================

/** Base staff information (minimal) */
export interface BaseStaff {
    id: number;
    username: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    role: number;
    roleObj: IdNamePair;
}

/** Full staff information with all fields */
export interface StaffItem extends BaseStaff, BaseEntity {
    description: string | null;
    tenantId: number;
    tenant: string | null;
    status: number;
    isAdmin: boolean;
    bufferTime: string | null;
    staffLogin: string | null;
    avatarUrl: string | null;
}

/** Staff in service context (simplified) */
export interface StaffItemInService extends BaseStaff { }

/** Staff in detail booking response */
export interface StaffDetailBookingItemResponse extends BaseStaff {
    email: any; // Note: API returns any for email in detail response
}

// ==================== Service Types ====================

/** Base service information */
export interface BaseService {
    id: number;
    serviceName: string;
    price: number;
    serviceTime: number;
}

/** Service item in booking manager */
export interface ServiceItem extends BaseService {
    serviceCode: string | null;
    staff: StaffItemInService | null;
    promotion: any | null;
}

/** Service in detail booking response */
export interface ServiceDetailBookingItemResponse extends BaseService {
    serviceCode: any;
    staff?: StaffDetailBookingItemResponse;
    promotion: any;
}

// ==================== Booking Status Types ====================

export interface BookingStatusItem extends IdNamePair { }

export interface ListBookingStatusResponse {
    items: BookingStatusItem[];
}

// ==================== Booking Hour Types ====================

export interface ListBookingHourSettingResponse extends BaseEntity {
    tenantId: number,
    staffId: number,
    dayId: number,
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
    name: string | null
}

// ==================== Booking Manager Types ====================

export interface BookingManagerItem extends BaseEntity {
    code: string;
    bookingDate: string;
    bookingHours: string;
    status: number;
    statusObj: IdNamePair;
    description: string;
    services: ServiceItem[];
    frequency: Frequency;
    customer: Customer;
}

export interface ListBookingManagerResponse extends PaginationResponse<BookingManagerItem> { }

// ==================== Detail Booking Types ====================

export interface DetailBookingItemResponse extends BaseEntity {
    code: string;
    bookingDate: string;
    bookingHours: string;
    status: number;
    statusObj: IdNamePair;
    description: string;
    services: ServiceDetailBookingItemResponse[];
    frequency: Frequency;
    customer: Customer;
    creator: any; // Note: API returns any for creator in detail response
}

export interface HistoryBookingItemResponse extends PaginationResponse<HistoryBookingItem> {
    items: HistoryBookingItem[];
}

export interface HistoryBookingItem extends BaseEntity {
    id: number
    serviceName: string
    price: number
    serviceTime: number
    staff?: StaffItem
    dateUsed: string
    creator: any
    createdAt: any
    lastModifiedAt: any
    informations: any
    warnings: any
    errors: any
}

export interface ListBookingSettingResponse {
    id: number;
    bookingPolicy: string;
    aboutUs: string;
    appointmentLeadTimeDays: number;
    appointmentLeadTimeHours: number;
    appointmentLeadTimeMins: number;
    bookingTimeRangeMonths: number;
    bookingTimeRangeWeeks: number;
    bookingTimeRangeDays: number;
    bookingSlotSize: string;
    skipLogin: boolean;
}

// ==================== Staff List Response ====================

export interface ListStaffResponse extends PaginationResponse<StaffItem> { }

export interface ListServiceResponse extends PaginationResponse<ListServiceResponseItem> {
    items: ListServiceResponseItem[];
}

export interface ListServiceResponseItem extends BaseEntity {
    name: string
    price: number
    url: string
    serviceTime: number
    bufferTime: number
    description: string
    systemCatalogIds: number[]
    employeeIds: number[]
    specialists: Specialist[]
    systemCatalogs: SystemCatalog[]
    id: number
    creator: any
    createdAt: string
    lastModifiedAt: string
    informations: any
    warnings: any
    errors: any
}

export interface Specialist extends BaseEntity {
    serviceManagementId: number
    employeeId: number
    employeeName: string
}

export interface SystemCatalog extends BaseEntity {
    serviceManagementId: number
    systemCatalogId: number
}

// ==================== Legacy Type Exports (for backward compatibility) ====================

/** @deprecated Use IdNamePair instead */
export type StatusObjDetailBookingItemR = IdNamePair;

/** @deprecated Use IdNamePair instead */
export type RoleObjDetailBookingItemResponse = IdNamePair;
