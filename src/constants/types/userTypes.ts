import {UserRole, UserStatus} from "@/constants/types/enums";
import {OrganizationCompactResponse} from "@/constants/types/organizationTypes";
import {TeamCompactResponse} from "@/constants/types/teamTypes";
import {LeavePolicyCompactResponse} from "@/constants/types/leaveTypes.ts";

export type UserCreateRequest = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    timezone: string;
    country: string;
    teamId: number;
    leavePolicyId: number;
}

export type UserUpdateRequest = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    avatarAssetId?: number;
    leavePolicyId?: number;
    teamId?: number;
}

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string
}

export type UserResponse = {
    id: number;
    status: UserStatus;
    role: UserRole;
    email: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    team: TeamCompactResponse;
    timezone: string | null;
    country: string | null;
    organization: OrganizationCompactResponse;
    avatar: AssetResponse;
    leavePolicy: LeavePolicyCompactResponse;
}

export type AssetResponse = {
    id: number;
    size: number;
    name: string
    contentType: string;
    url: string;
    category: string;
}