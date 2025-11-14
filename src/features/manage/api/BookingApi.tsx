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

export const getListStaffApi = async () => {
    return http.getPortal<ListStaffResponse>('/api/Staff/List');
}