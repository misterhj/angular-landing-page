export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    identityDocument?: string;
    phoneNumber?: string;
    username: string;
    isActive?: boolean;
}