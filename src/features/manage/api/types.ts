
export interface BaseEntity {
    id: number;
    creator: string | null;
    createdAt: string;
    lastModifiedAt: string;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
}

export interface PaginationResponse<T> {
    pageIndex: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    items: T[];
}

export interface IdNamePair {
    id: number;
    name: string;
}

export interface Customer {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    customerGroup: any;
}

export interface Frequency {
    frequencyType: number | null;
    fromDate: string | null;
    endDate: string | null;
}

export interface BaseStaff {
    id: number;
    username: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    role: number;
    roleObj: IdNamePair;
}

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

export interface StaffItemInService extends BaseStaff { }

export interface StaffDetailBookingItemResponse extends BaseStaff {
    email: any;
}

export interface BaseService {
    id: number;
    serviceName: string;
    price: number;
    serviceTime: number;
}

export interface ServiceItem extends BaseService {
    serviceCode: string | null;
    staff: StaffItemInService | null;
    promotion: any | null;
}

export interface ServiceDetailBookingItemResponse extends BaseService {
    serviceCode: any;
    serviceId?: number;
    staff?: StaffDetailBookingItemResponse;
    promotion: any;
}

export interface BookingStatusItem extends IdNamePair { }

export interface ListBookingStatusResponse {
    items: BookingStatusItem[];
}

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
    creator: any;
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

export interface ListBookingFrequencyResponse extends IdNamePair { }

export interface ListCustomerListResponse extends PaginationResponse<customerInfo> {
    items: customerInfo[];
}

export interface customerInfo {
    code: string
    name: string
    phoneNumber: string
    email: string
    dateOfBirth?: string | number | null
    monthOfBirth?: number | null
    yearOfBirth?: number | null
    appUserId: any
    appUserObj: any
    tenantId: number
    tenantObj: any
    gender: number
    genderObj: IdNamePair
    systemCatalogId: any
    systemCatalogObj: any
    address?: string
    description?: string
    staffNote?: string
    status: number
    statusObj: IdNamePair
    totalExpense: number
    timesOfServiceUsage: number
    avatarUrl: string
    isNewAvatar: boolean
    monthBirth?: number | null
    dayBirth?: number | null
    isSendReview: boolean
    historyUsageService: any[]
    id: number
    creator: any
    createdAt: string
    lastModifiedAt: string
    informations: any
    warnings: any
    errors: any
}

export interface CreateUserBookingRequest {
    id: number | null
    code: string | null
    name: string | null
    phoneNumber: string | null
    email: string | null
    dateOfBirth: number | null
    monthOfBirth: number | null
    yearOfBirth: number | null
    gender: number | null
    systemCatalogId: number | null
    address: string | null
    description: string | null
    staffNote: string | null
    dayBirth: number | null
    monthBirth: number | null
    password: string | null
}

export interface CreateBookingRequest {
    bookingDate: string | null
    bookingHours: string | null
    status: number | null
    description: string | null
    services: ServiceCreateBookingRequest[]
    frequency: Frequency | null
    customer: CustomerCreateBookingRequest | null
}

export interface ServiceCreateBookingRequest {
    serviceId: number | null
    staffId: number | null
    serviceTime: number
    promotionId: number | null
}

export interface CustomerCreateBookingRequest {
    id: number | null
    name: string | null
}

export interface EditBookingRequest {
    id: number | null
    status: number | null
    services: ServiceEditBookingRequest[] | null
}

export interface ServiceEditBookingRequest {
    serviceId: number | null
    staffId: number | null
    serviceTime: number | null
    servicePrice: number | null
}

export interface PaymentBookingRequest {
    id: number
    services: ServiceCreateBookingRequest[]
    voucherId: number
    amount: number
    amountVouchers: number
    totalAmount: number
    paymentType: number
    customerPayment: number
    customerChange: number
    isInvoice: boolean
}

export interface PaymentItem {
    id: number
    services: PaymentServiceItem[]
    voucherId: number
    amount: number
    amountVouchers: number
    totalAmount: number
    paymentType: number
    customerPayment: number
    customerChange: number
    isInvoice: boolean
}

export interface PaymentServiceItem {
    serviceId: number
    staffId: number | null
    serviceTime: number
    promotionId: number | null
    serviceName: string
    price: number
    serviceCode: string
}

export interface ListPromotionResponse extends PaginationResponse<promotionItem> {
    items: promotionItem[];
}

export interface promotionItem {
    stt: number
    code: string
    tenantId: number
    name: string
    description: string
    discountType: number
    discountTypeObj: DiscountTypeObj
    discountValue: number
    effectiveFrom: string
    effectiveTo: string
    listDayOfWeek: any[]
    hasTimeFrame: boolean
    timeFrom: any
    timeTo: any
    statusName: string
    applyAllCustomerTypes: boolean
    applyAllServiceTypes: boolean
    customerGroups: any[]
    serviceManagements: any[]
    customerGroupIds: any[]
    serviceManagementIds: any[]
    quantityUsed: number
    revenue: number
    id: number
    creator: any
    createdAt: string
    lastModifiedAt: string
    informations: any
    warnings: any
    errors: any
}

export interface DiscountTypeObj {
    id: number
    name: string
    description: string
}

export interface PutPaymentBookingRequest {
 id: number
  services: ServicePaymentBookingRequest[]
  voucherId: number | null
  amount: number | null
  amountVouchers: number | null
  totalAmount: number
  paymentType: number | null
  customerPayment: number | null
  customerChange: number | null
  isInvoice: boolean
}

export interface ServicePaymentBookingRequest {
    serviceId: number
    staffId: number | null
    serviceTime: number | null
    promotionId: number | null
}

export interface VoucherResponse {
    stt: number
    tenantId: number
    url: any
    code: string
    name: string
    description: any
    isUnlimited: boolean
    quantity: number
    discountType: number
    discountTypeObj: DiscountTypeObj
    discountValue: number
    hasMinimumOrderAmount: boolean
    minimumOrderAmount: number
    isPermanent: boolean
    effectiveFrom: string
    effectiveTo: string
    applyAllCustomerTypes: boolean
    status: number
    statusObj: StatusObj
    customerGroupIds: any[]
    customerGroups: any[]
    quantityUsed: number
    quantityRemaining: number
    id: number
    creator: any
    createdAt: string
    lastModifiedAt: string
    informations: any
    warnings: any
    errors: any
}

export interface DiscountTypeObj {
    id: number
    name: string
  }
  
  export interface StatusObj {
    id: number
    name: string
  }

  export interface ListStaffManager {
    id: number,
    name: string,
    code: string,
  }