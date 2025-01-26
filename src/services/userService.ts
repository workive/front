import axiosInstance from './httpService';
import {
    AssetResponse,
    ChangePasswordRequest,
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest
} from "@/constants/types/userTypes";
import {PagedResponse} from '@/constants/types/commonTypes'

const baseURL = '/users';

async function createUser(payload: UserCreateRequest): Promise<UserResponse> {
    const response = await axiosInstance.post(baseURL, payload);
    return response.data;
}

async function getUsers(pageNumber: number, pageSize: number): Promise<PagedResponse<UserResponse>> {
    const response = await axiosInstance.get(baseURL, {
        params: {pageNumber, pageSize}
    })
    return response.data;
}

async function getUser(userId: string = 'mine'): Promise<UserResponse> {
    const response = await axiosInstance.get(`${baseURL}/${userId}`);
    return response.data;
}

async function deleteUser(id: string) {
    const response = await axiosInstance.delete(`${baseURL}/${id}`);
    return response.data;
}

async function updateUser(userId: string = 'mine', payload: UserUpdateRequest): Promise<UserResponse> {
    const response = await axiosInstance.patch(`${baseURL}/${userId}`, payload);
    return response.data;
}

async function updateUserPassword(payload: ChangePasswordRequest, id: number) {
    const response = await axiosInstance.patch(`${baseURL}/${id}/password`, payload);
    return response.data;
}

// asset

async function createAssets(bucket: string, files: File[]): Promise<AssetResponse[]> {
    const formData = new FormData();
    // Append all files to FormData
    files.forEach((file) => {
        formData.append('files', file);
    });
    const response = await axiosInstance.post(`/assets`, formData, {
        params: { bucket },
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export {updateUserPassword, updateUser, deleteUser, getUsers, getUser, createUser, createAssets}