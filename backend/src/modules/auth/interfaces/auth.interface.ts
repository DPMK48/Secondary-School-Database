export interface JwtPayload {
  sub: number;
  username: string;
  roleId: number;
  roleName: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    role: string;
    mustChangePassword: boolean;
    teacherId?: number | null;
    studentId?: number | null;
  };
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only for development
}
