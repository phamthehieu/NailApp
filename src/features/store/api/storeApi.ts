import { http } from '@/services/api/http';

export interface ListChooseShopResponse {
    appUserID: number;
    storeId: number;
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
    code: string;
    name: string;
}

export interface PostSelectStoreRequest {
    token: string;
    refreshToken: string | null;
    id: number;
    creator: string | null;
    createdAt: string | null;
    lastModifiedAt: string | null;
    informations: string | null;
    warnings: string | null;
    errors: string | null;
}

export async function listChooseShopApi(userId: number): Promise<ListChooseShopResponse[]> {
    return http.getPortal<ListChooseShopResponse[]>(`/api/AppUser/ListStore_ByIdUser?UserId=${userId}`);
}

export async function postSelectStoreApi(storeId: number): Promise<PostSelectStoreRequest> {
    return http.postPortal<PostSelectStoreRequest>(`/api/StaffProfile/SelectStore?IdStore=${storeId}`);
}