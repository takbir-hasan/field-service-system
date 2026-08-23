export interface LoginPayload {
  email: string;
  password: string;
}

export type UserRole = "ADMIN" | "TECHNICIAN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}